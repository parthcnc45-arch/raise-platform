import { Request, Response } from 'express';
import crypto from 'crypto';
import { supabase } from '../config/supabase.js';
import { sendEmail } from '../services/emailService.js';
import { getMagicLinkEmailTemplate } from '../views/emails/magicLinkEmail.js';
import { UAParser } from 'ua-parser-js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const createGpApplication = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, company, event } = req.body;

    if (!firstName || firstName.length < 2 || firstName.length > 50) {
      return res.status(400).json({ success: false, message: 'First name must be between 2 and 50 characters' });
    }
    if (!lastName || lastName.length < 2 || lastName.length > 50) {
      return res.status(400).json({ success: false, message: 'Last name must be between 2 and 50 characters' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    if (!company || company.length < 2 || company.length > 100) {
      return res.status(400).json({ success: false, message: 'Company name must be between 2 and 100 characters' });
    }

    if (!event) {
      return res.status(400).json({ success: false, message: 'Event is required' });
    }

    const { data: eventDetails, error: eventError } = await supabase
      .from('events')
      .select('id, name, status, is_active')
      .eq('id', event)
      .maybeSingle();

    if (eventError || !eventDetails) {
      return res.status(400).json({ success: false, message: 'Selected event was not found' });
    }
    if (eventDetails.status?.toLowerCase() !== 'active' && eventDetails.is_active !== true) {
      return res.status(400).json({ success: false, message: 'Applications can only be created for active events' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check for duplicate application
    const { data: existingApp } = await supabase
      .from('gp_applications')
      .select('id')
      .eq('email', normalizedEmail)
      .eq('event_id', event)
      .is('deleted_at', null)
      .maybeSingle();

    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: 'You have created application for this event with this email address',
      });
    }

    const magic_token = crypto.randomBytes(32).toString('hex');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const magic_link = `${frontendUrl}/gp-application/view/${magic_token}`;

    const eventName = eventDetails.name;

    let initialStatus = 'pending';
    try {
      const { subject, text, html } = getMagicLinkEmailTemplate(firstName, eventName, magic_link);
      await sendEmail(normalizedEmail, subject, text, html);
      initialStatus = 'successful';
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      initialStatus = 'failed';
    }

    const { data: savedApplication, error: insertError } = await supabase
      .from('gp_applications')
      .insert({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: normalizedEmail,
        company: company.trim(),
        event_id: event,
        status: initialStatus,
        magic_token,
        magic_link,
      })
      .select('*')
      .single();

    if (insertError || !savedApplication) {
      console.error('Error inserting GP application:', insertError);
      return res.status(500).json({ success: false, message: insertError?.message || 'Server error' });
    }

    res.status(201).json({
      success: true,
      message: 'GP Application created successfully',
      data: {
        ...savedApplication,
        _id: savedApplication.id,
        firstName: savedApplication.first_name,
        lastName: savedApplication.last_name,
        event: savedApplication.event_id,
      },
    });
  } catch (error: any) {
    console.error('Error creating GP application:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getGpApplications = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1;

    let query = supabase
      .from('gp_applications')
      .select('id, first_name, last_name, email, company, status, created_at, event_id, magic_link_accessed, magic_link_first_accessed_at, magic_link_last_accessed_at, magic_link_access_count, events:event_id(id, name)', { count: 'exact' })
      .is('deleted_at', null);

    if (search.trim()) {
      query = query.or(`first_name.ilike.%${search.trim()}%,last_name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%,company.ilike.%${search.trim()}%`);
    }

    const { data: applications, count, error } = await query
      .order('created_at', { ascending: false })
      .range(startIndex, endIndex);

    if (error) {
      console.error('Error fetching GP applications:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    const totalRecords = count || 0;
    const totalPages = Math.ceil(totalRecords / limit);

    const formattedApplications = (applications || []).map((app: any) => {
      const eventObj = Array.isArray(app.events) ? app.events[0] : app.events;
      return {
        id: app.id,
        _id: app.id,
        firstName: app.first_name,
        lastName: app.last_name,
        email: app.email,
        company: app.company,
        event: eventObj ? eventObj.name : 'Unknown Event',
        eventId: eventObj ? eventObj.id : app.event_id,
        status: app.status,
        created_at: app.created_at,
        magic_link_accessed: app.magic_link_accessed ?? false,
        magic_link_first_accessed_at: app.magic_link_first_accessed_at ?? null,
        magic_link_last_accessed_at: app.magic_link_last_accessed_at ?? null,
        magic_link_access_count: app.magic_link_access_count ?? 0,
      };
    });

    res.status(200).json({
      success: true,
      data: formattedApplications,
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalRecords,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error('Error fetching GP applications:', error);
    res.status(500).json({ success: false, message: error?.message || 'Failed to fetch GP applications' });
  }
};

export const deleteGpApplication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof id !== 'string' || !UUID_REGEX.test(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const { data: application, error: fetchError } = await supabase
      .from('gp_applications')
      .select('id')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (fetchError || !application) {
      return res.status(404).json({ success: false, message: 'GP Application not found' });
    }

    // Soft delete
    const { error: updateError } = await supabase
      .from('gp_applications')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) {
      return res.status(500).json({ success: false, message: updateError.message });
    }

    res.status(200).json({ success: true, message: 'GP Application deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting GP application:', error);
    res.status(500).json({ success: false, message: error?.message || 'Failed to delete GP application' });
  }
};

export const updateGpApplication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, company, event, status } = req.body;

    if (typeof id !== 'string' || !UUID_REGEX.test(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const { data: application, error: fetchError } = await supabase
      .from('gp_applications')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (fetchError || !application) {
      return res.status(404).json({ success: false, message: 'GP Application not found' });
    }

    if (firstName !== undefined && (typeof firstName !== 'string' || firstName.trim().length < 2 || firstName.trim().length > 50)) {
      return res.status(400).json({ success: false, message: 'First name must be between 2 and 50 characters' });
    }
    if (lastName !== undefined && (typeof lastName !== 'string' || lastName.trim().length < 2 || lastName.trim().length > 50)) {
      return res.status(400).json({ success: false, message: 'Last name must be between 2 and 50 characters' });
    }

    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (typeof email !== 'string' || !emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email address' });
      }
    }

    if (company !== undefined && (typeof company !== 'string' || company.trim().length < 2 || company.trim().length > 100)) {
      return res.status(400).json({ success: false, message: 'Company name must be between 2 and 100 characters' });
    }

    if (event !== undefined && (typeof event !== 'string' || event.trim().length === 0)) {
      return res.status(400).json({ success: false, message: 'Event is required' });
    }

    if (event !== undefined) {
      const { data: selectedEvent, error: eventError } = await supabase
        .from('events')
        .select('id, status, is_active')
        .eq('id', event)
        .maybeSingle();

      if (eventError || !selectedEvent) {
        return res.status(400).json({ success: false, message: 'Selected event was not found' });
      }
      if (selectedEvent.status?.toLowerCase() !== 'active' && selectedEvent.is_active !== true) {
        return res.status(400).json({ success: false, message: 'Applications can only be assigned to active events' });
      }
    }

    // Check duplicate if email or event updated
    if (email !== undefined || event !== undefined) {
      const checkEmail = email !== undefined ? email.toLowerCase().trim() : application.email;
      const checkEvent = event !== undefined ? event : application.event_id;

      const { data: existingApp } = await supabase
        .from('gp_applications')
        .select('id')
        .eq('email', checkEmail)
        .eq('event_id', checkEvent)
        .neq('id', id)
        .is('deleted_at', null)
        .maybeSingle();

      if (existingApp) {
        return res.status(400).json({
          success: false,
          message: 'You have created application for this event with this email address',
        });
      }
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (firstName !== undefined) updates.first_name = firstName.trim();
    if (lastName !== undefined) updates.last_name = lastName.trim();
    if (email !== undefined) updates.email = email.toLowerCase().trim();
    if (company !== undefined) updates.company = company.trim();
    if (event !== undefined) updates.event_id = event;
    if (status !== undefined) updates.status = status;

    const { data: updatedApp, error: updateError } = await supabase
      .from('gp_applications')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (updateError || !updatedApp) {
      return res.status(500).json({ success: false, message: updateError?.message || 'Server error' });
    }

    res.status(200).json({
      success: true,
      message: 'GP Application updated successfully',
      data: {
        ...updatedApp,
        _id: updatedApp.id,
        firstName: updatedApp.first_name,
        lastName: updatedApp.last_name,
        event: updatedApp.event_id,
      },
    });
  } catch (error: any) {
    console.error('Error updating GP application:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getGpApplicationByMagicToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { email } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required' });
    }

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const { data: application, error: fetchError } = await supabase
      .from('gp_applications')
      .select('*, events:event_id(name)')
      .eq('magic_token', token)
      .is('deleted_at', null)
      .maybeSingle();

    if (fetchError || !application) {
      return res.status(404).json({ success: false, message: 'Invalid magic link.' });
    }

    if (application.email.toLowerCase() !== email.toLowerCase().trim()) {
      return res.status(403).json({ success: false, message: 'Email is not valid for this link.' });
    }

    // Track only after the token and registered email have both been validated.
    const { data: trackedApplication, error: trackingError } = await supabase
      .rpc('track_gp_application_magic_link_access', { application_id: application.id });

    if (trackingError || !trackedApplication) {
      console.error('Error tracking GP application magic link access:', trackingError);
      return res.status(500).json({ success: false, message: 'Unable to load application. Please try again.' });
    }

    const loadedApplication = Array.isArray(trackedApplication) ? trackedApplication[0] : trackedApplication;
    const eventRelation = Array.isArray(application.events) ? application.events[0] : application.events;

    // Capture access log
    try {
      const userAgentString = req.headers['user-agent'] || '';
      const parser = new UAParser(userAgentString);
      const browser = parser.getBrowser();
      const os = parser.getOS();
      const device = parser.getDevice();

      const forwardedIps = req.headers['x-forwarded-for'] as string;
      const realIp = forwardedIps ? forwardedIps.split(',')[0].trim() : req.ip || req.socket?.remoteAddress || '';

      const logEntry = {
        ip_address: realIp,
        browser: browser.name ? `${browser.name} ${browser.version || ''}`.trim() : '',
        os: os.name ? `${os.name} ${os.version || ''}`.trim() : '',
        device: device.type || device.vendor || device.model ? `${device.vendor || ''} ${device.model || ''} ${device.type || ''}`.trim() : '',
        accessed_at: new Date().toISOString(),
      };

      const accessLogs = Array.isArray(application.access_logs) ? application.access_logs : [];
      accessLogs.push(logEntry);

      await supabase
        .from('gp_applications')
        .update({ access_logs: accessLogs })
        .eq('id', application.id);
    } catch (logError) {
      console.error('Error saving access log:', logError);
    }

    res.status(200).json({
      success: true,
      message: 'Application loaded successfully.',
      data: {
        ...loadedApplication,
        _id: loadedApplication.id,
        firstName: loadedApplication.first_name,
        lastName: loadedApplication.last_name,
        event_name: eventRelation?.name || null,
      },
    });
  } catch (error: any) {
    console.error('Error fetching application by magic token:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const resendMagicLink = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof id !== 'string' || !UUID_REGEX.test(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const { data: application, error: fetchError } = await supabase
      .from('gp_applications')
      .select('*, events:event_id(name)')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (fetchError || !application) {
      return res.status(404).json({ success: false, message: 'GP Application not found' });
    }

    let { magic_token, magic_link, email, first_name } = application;
    const eventObj = Array.isArray(application.events) ? application.events[0] : application.events;
    const eventName = eventObj?.name || 'the event';

    if (!magic_token || !magic_link) {
      magic_token = crypto.randomBytes(32).toString('hex');
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      magic_link = `${frontendUrl}/gp-application/view/${magic_token}`;

      await supabase
        .from('gp_applications')
        .update({ magic_token, magic_link })
        .eq('id', id);
    }

    try {
      const { subject, text, html } = getMagicLinkEmailTemplate(first_name, eventName, magic_link);
      await sendEmail(email, subject, text, html);

      await supabase
        .from('gp_applications')
        .update({ status: 'resended' })
        .eq('id', id);

      res.status(200).json({
        success: true,
        message: 'Magic link sent successfully',
      });
    } catch (emailError: any) {
      console.error('Email sending failed during resend:', emailError);
      await supabase
        .from('gp_applications')
        .update({ status: 'failed' })
        .eq('id', id);

      return res.status(500).json({
        success: false,
        message: 'Failed to send magic link',
        error: emailError?.message,
      });
    }
  } catch (error: any) {
    console.error('Error resending magic link:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
