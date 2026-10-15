import { Request, Response } from 'express';
import crypto from 'crypto';
import GpApplication from '../models/GpApplication';
import Event from '../models/Event';
import { sendEmail } from '../services/emailService';
import { getMagicLinkEmailTemplate } from '../views/emails/magicLinkEmail';
import { UAParser } from 'ua-parser-js';

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

    // Check for duplicate application (same email for the same event)
    const existingApplication = await GpApplication.findOne({ email, event });
    if (existingApplication) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have created application for this event with this email address' 
      });
    }

    const magic_token = crypto.randomBytes(32).toString('hex');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const magic_link = `${frontendUrl}/gp-application/view/${magic_token}`;

    const newApplication = new GpApplication({
      firstName,
      lastName,
      email,
      company,
      event,
      magic_token,
      magic_link,
    });

    let savedApplication = await newApplication.save();

    // Fetch event name for email
    const eventDetails = await Event.findById(event);
    const eventName = eventDetails ? eventDetails.name : 'the event';

    // Send email and update status
    try {
      const { subject, text, html } = getMagicLinkEmailTemplate(firstName, eventName, magic_link);
      await sendEmail(email, subject, text, html);
      savedApplication.status = 'successful';
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      savedApplication.status = 'failed';
    }
    
    savedApplication = await savedApplication.save();

    res.status(201).json({
      success: true,
      message: 'GP Application created successfully',
      data: savedApplication,
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

    const query: any = { deleted_at: null };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const startIndex = (page - 1) * limit;

    const totalRecords = await GpApplication.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit);

    const applications = await GpApplication.find(query)
      .populate('event', 'name')
      .skip(startIndex)
      .limit(limit)
      .sort({ _id: -1 });

    const formattedApplications = applications.map((app: any) => ({
      id: app._id,
      firstName: app.firstName,
      lastName: app.lastName,
      email: app.email,
      company: app.company,
      event: app.event ? app.event.name : 'Unknown Event',
      eventId: app.event ? app.event._id : null,
      status: app.status,
      created_at: app.created_at,
    }));

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

    const application = await GpApplication.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'GP Application not found' });
    }

    // Soft delete
    application.deleted_at = new Date();
    await application.save();

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

    const application = await GpApplication.findById(id);
    if (!application || application.deleted_at) {
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

    // Check for duplicate application if email or event is changing
    if (email !== undefined || event !== undefined) {
      const checkEmail = email !== undefined ? email : application.email;
      const checkEvent = event !== undefined ? event : application.event;
      
      const existingApplication = await GpApplication.findOne({ 
        email: checkEmail, 
        event: checkEvent,
        _id: { $ne: id },
        deleted_at: null
      });
      
      if (existingApplication) {
        return res.status(400).json({ 
          success: false, 
          message: 'You have created application for this event with this email address' 
        });
      }
    }

    if (firstName !== undefined) application.firstName = firstName.trim();
    if (lastName !== undefined) application.lastName = lastName.trim();
    if (email !== undefined) application.email = email.trim();
    if (company !== undefined) application.company = company.trim();
    if (event !== undefined) application.event = event;
    if (status !== undefined) application.status = status;

    const updatedApplication = await application.save();

    res.status(200).json({
      success: true,
      message: 'GP Application updated successfully',
      data: updatedApplication,
    });
  } catch (error: any) {
    console.error('Error updating GP application:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ==========================================
// MAGIC LINK CONTROLLERS
// ==========================================

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

    const application = await GpApplication.findOne({ magic_token: token, deleted_at: null }).populate('event', 'name');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Invalid magic link.' });
    }

    if (application.email.toLowerCase() !== email.toLowerCase().trim()) {
      return res.status(403).json({ success: false, message: 'Email is not valid for this link.' });
    }

    // Capture Access Log
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
          accessed_at: new Date(),
        };

        if (!application.access_logs) {
          application.access_logs = [];
        }
        application.access_logs.push(logEntry as any);
        await application.save();
      } catch (logError) {
        console.error('Error saving access log:', logError);
        // We don't want to fail the request if logging fails
      }

    res.status(200).json({
      success: true,
      message: 'Application loaded successfully.',
      data: application,
    });
  } catch (error: any) {
    console.error('Error fetching application by magic token:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const resendMagicLink = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const application = await GpApplication.findById(id).populate('event');
    
    if (!application || application.deleted_at) {
      return res.status(404).json({ success: false, message: 'GP Application not found' });
    }

    let { magic_token, magic_link, email, firstName } = application;
    const eventName = (application.event as any)?.name || 'the event';

    if (!magic_token || !magic_link) {
      magic_token = crypto.randomBytes(32).toString('hex');
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      magic_link = `${frontendUrl}/gp-application/view/${magic_token}`;
      
      application.magic_token = magic_token;
      application.magic_link = magic_link;
      await application.save();
    }

    // Send email and update status
    try {
      const { subject, text, html } = getMagicLinkEmailTemplate(firstName, eventName, magic_link);
      await sendEmail(email, subject, text, html);
      
      application.status = 'resended';
      await application.save();
      
      res.status(200).json({
        success: true,
        message: 'Magic link sent successfully',
      });
    } catch (emailError) {
      console.error('Email sending failed during resend:', emailError);
      application.status = 'failed';
      await application.save();
      
      return res.status(500).json({ success: false, message: 'Failed to send magic link', error: (emailError as any).message });
    }
  } catch (error: any) {
    console.error('Error resending magic link:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
