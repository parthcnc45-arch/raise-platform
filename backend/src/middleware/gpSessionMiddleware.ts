import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { getFrontendBaseUrl } from '../services/magicLinkService.js';

export const GP_SESSION_COOKIE = 'gp_session';
const GP_SESSION_AUDIENCE = 'gp-portal';
const SESSION_TTL_HOURS = Number(process.env.GP_SESSION_TTL_HOURS) > 0 ? Number(process.env.GP_SESSION_TTL_HOURS) : 24;

export interface GpSessionRequest extends Request {
  gpApplication?: any;
}

const getSecret = (): string => {
  const secret = process.env.GP_SESSION_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('GP_SESSION_SECRET (or JWT_SECRET) is not configured');
  }
  return secret;
};

// The frontend and backend are usually on different sites in production (e.g. Vercel + Render),
// so the cookie must be SameSite=None; Secure there. On localhost http, SameSite=Lax is used.
const getCookieOptions = () => {
  const crossSite = getFrontendBaseUrl().startsWith('https://');
  return {
    httpOnly: true,
    secure: crossSite,
    sameSite: (crossSite ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
  };
};

const parseCookies = (header: string | undefined): Record<string, string> => {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (!key) continue;
    try {
      out[key] = decodeURIComponent(value);
    } catch {
      out[key] = value;
    }
  }
  return out;
};

// `th` binds the session to the current token hash, so rotating the magic link (resend) ends old sessions.
export const issueGpSession = (res: Response, application: { id: string; magic_token_hash: string }) => {
  const sessionToken = jwt.sign(
    { sub: application.id, th: application.magic_token_hash.slice(0, 16) },
    getSecret(),
    { audience: GP_SESSION_AUDIENCE, expiresIn: `${SESSION_TTL_HOURS}h` }
  );
  res.cookie(GP_SESSION_COOKIE, sessionToken, {
    ...getCookieOptions(),
    maxAge: SESSION_TTL_HOURS * 60 * 60 * 1000,
  });
};

export const clearGpSession = (res: Response) => {
  res.clearCookie(GP_SESSION_COOKIE, getCookieOptions());
};

export const requireGpSession = async (req: GpSessionRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sessionToken = parseCookies(req.headers.cookie)[GP_SESSION_COOKIE];
    if (!sessionToken) {
      res.status(401).json({ success: false, message: 'No active session.' });
      return;
    }

    const decoded = jwt.verify(sessionToken, getSecret(), { audience: GP_SESSION_AUDIENCE }) as jwt.JwtPayload;

    const { data: application, error } = await supabase
      .from('gp_applications')
      .select('*, events:event_id(name)')
      .eq('id', decoded.sub)
      .is('deleted_at', null)
      .maybeSingle();

    if (
      error ||
      !application ||
      !application.magic_token_hash ||
      application.magic_token_hash.slice(0, 16) !== decoded.th
    ) {
      clearGpSession(res);
      res.status(401).json({ success: false, message: 'Session is no longer valid.' });
      return;
    }

    req.gpApplication = application;
    next();
  } catch {
    clearGpSession(res);
    res.status(401).json({ success: false, message: 'Session is invalid or has expired.' });
  }
};
