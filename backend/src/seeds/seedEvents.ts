import 'dotenv/config';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import Event from '../models/Event.js';

const dummyEvents = [
  {
    "name": "Global Summit 2026",
    "slug": "global-summit-2026",
    "description": "Global Summit annual event for emerging fund managers and limited partners.",
    "event_year": 2026,
    "start_date": "2026-09-15T00:00:00.000Z",
    "end_date": "2026-09-17T00:00:00.000Z",
    "application_start_date": "2026-05-01T00:00:00.000Z",
    "application_end_date": "2026-07-31T23:59:59.000Z",
    "status": "closed",
    "is_active": false,
    "email_settings": {
      "use_custom_email": true,
      "application_invitation_subject": "Invitation to Global Summit 2026",
      "application_invitation_body": "Please complete your GP application for Global Summit 2026.",
      "application_reminder_subject": "Complete Your Global Summit 2026 Application",
      "application_reminder_body": "Please complete your pending application.",
      "submission_confirmation_subject": "Application Submitted Successfully",
      "submission_confirmation_body": "Thank you for submitting your application."
    },
    "created_at": "2026-01-10T10:00:00.000Z",
    "updated_at": "2026-08-01T10:00:00.000Z"
  },
  {
    "name": "Global Summit 2027",
    "slug": "global-summit-2027",
    "description": "Global Summit 2027 for emerging managers.",
    "event_year": 2027,
    "start_date": "2027-09-14T00:00:00.000Z",
    "end_date": "2027-09-16T00:00:00.000Z",
    "application_start_date": "2027-05-01T00:00:00.000Z",
    "application_end_date": "2027-07-31T23:59:59.000Z",
    "status": "active",
    "is_active": true,
    "email_settings": {
      "use_custom_email": true,
      "application_invitation_subject": "Invitation to Global Summit 2027",
      "application_invitation_body": "Please complete your GP application for Global Summit 2027.",
      "application_reminder_subject": "Reminder: Complete Your Application",
      "application_reminder_body": "Your application is still pending.",
      "submission_confirmation_subject": "Application Submitted",
      "submission_confirmation_body": "Your application has been submitted successfully."
    },
    "created_at": "2026-02-01T10:00:00.000Z",
    "updated_at": "2026-10-01T10:00:00.000Z"
  },
  {
    "name": "Emerging Managers Forum 2027",
    "slug": "emerging-managers-forum-2027",
    "description": "Forum connecting emerging fund managers with institutional investors.",
    "event_year": 2027,
    "start_date": "2027-11-10T00:00:00.000Z",
    "end_date": "2027-11-12T00:00:00.000Z",
    "application_start_date": "2027-06-01T00:00:00.000Z",
    "application_end_date": "2027-09-15T23:59:59.000Z",
    "status": "draft",
    "is_active": false,
    "email_settings": {
      "use_custom_email": false,
      "application_invitation_subject": "",
      "application_invitation_body": "",
      "application_reminder_subject": "",
      "application_reminder_body": "",
      "submission_confirmation_subject": "",
      "submission_confirmation_body": ""
    },
    "created_at": "2026-03-15T10:00:00.000Z",
    "updated_at": "2026-03-15T10:00:00.000Z"
  },
  {
    "name": "Global LP & GP Connect 2028",
    "slug": "global-lp-gp-connect-2028",
    "description": "Annual LP and GP networking and investment event.",
    "event_year": 2028,
    "start_date": "2028-04-18T00:00:00.000Z",
    "end_date": "2028-04-20T00:00:00.000Z",
    "application_start_date": "2027-12-01T00:00:00.000Z",
    "application_end_date": "2028-02-29T23:59:59.000Z",
    "status": "draft",
    "is_active": false,
    "email_settings": {
      "use_custom_email": true,
      "application_invitation_subject": "Apply for Global LP & GP Connect 2028",
      "application_invitation_body": "You are invited to submit your GP application.",
      "application_reminder_subject": "Application Reminder",
      "application_reminder_body": "Please complete your application.",
      "submission_confirmation_subject": "Application Received",
      "submission_confirmation_body": "We have received your application."
    },
    "created_at": "2026-04-01T10:00:00.000Z",
    "updated_at": "2026-04-01T10:00:00.000Z"
  },
  {
    "name": "RAISE Annual Summit 2028",
    "slug": "raise-annual-summit-2028",
    "description": "RAISE annual summit for emerging fund managers and LPs.",
    "event_year": 2028,
    "start_date": "2028-09-20T00:00:00.000Z",
    "end_date": "2028-09-22T00:00:00.000Z",
    "application_start_date": "2028-05-01T00:00:00.000Z",
    "application_end_date": "2028-07-31T23:59:59.000Z",
    "status": "draft",
    "is_active": false,
    "email_settings": {
      "use_custom_email": true,
      "application_invitation_subject": "RAISE Annual Summit 2028 Invitation",
      "application_invitation_body": "Please complete your GP application.",
      "application_reminder_subject": "RAISE Summit Application Reminder",
      "application_reminder_body": "Please complete your application before the deadline.",
      "submission_confirmation_subject": "RAISE Application Submitted",
      "submission_confirmation_body": "Thank you for submitting your application."
    },
    "created_at": "2026-05-01T10:00:00.000Z",
    "updated_at": "2026-05-01T10:00:00.000Z"
  }
];

async function seedEvents() {
  try {
    console.log('[Seed Events] Connecting to database...');
    await connectDatabase();

    // Optional: Clear existing events if you want a fresh start
    // await Event.deleteMany({});
    
    console.log('[Seed Events] Inserting events...');
    const result = await Event.insertMany(dummyEvents);
    
    console.log(`[Seed Events] ✅ Successfully inserted ${result.length} dummy events!`);
  } catch (error) {
    console.error('[Seed Events Error]', error);
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
    process.exit();
  }
}

seedEvents();
