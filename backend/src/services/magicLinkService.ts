import crypto from 'crypto';

const TOKEN_REGEX = /^[0-9a-f]{64}$/;

// Only the SHA-256 hash of a magic token is ever stored in the database.
export const hashMagicToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

export const generateMagicToken = (): { token: string; hash: string } => {
  const token = crypto.randomBytes(32).toString('hex');
  return { token, hash: hashMagicToken(token) };
};

export const isValidMagicTokenFormat = (token: unknown): token is string =>
  typeof token === 'string' && TOKEN_REGEX.test(token);

// The magic link is always built from the configured FRONTEND_URL.
// Request headers (Origin / Referer / Host) are never trusted for this.
export const getFrontendBaseUrl = (): string =>
  (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');

export const buildMagicLink = (token: string): string =>
  `${getFrontendBaseUrl()}/gp-application/view/${token}`;

// Constant-time string comparison (used for email matching).
export const safeEqual = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};
