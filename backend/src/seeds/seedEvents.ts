import 'dotenv/config';
import { supabase } from '../config/supabase.js';

const dummyEvents = [
  {
    name: 'Global Summit 2026',
    slug: 'global-summit-2026',
    description: 'Global Summit annual event for emerging fund managers and limited partners.',
    event_year: 2026,
    start_date: '2026-09-15T00:00:00.000Z',
    end_date: '2026-09-17T00:00:00.000Z',
    application_end_date: '2026-07-31T23:59:59.000Z',
    status: 'Inactive',
    is_active: false,
    email_settings: {
      use_custom_email: true,
      application_invitation_subject: 'Invitation to Global Summit 2026',
      application_invitation_body: 'Please complete your GP application for Global Summit 2026.',
      application_reminder_subject: 'Complete Your Global Summit 2026 Application',
      application_reminder_body: 'Please complete your pending application.',
      submission_confirmation_subject: 'Application Submitted Successfully',
      submission_confirmation_body: 'Thank you for submitting your application.',
    },
  },
  {
    name: 'Global Summit 2027',
    slug: 'global-summit-2027',
    description: 'Global Summit 2027 for emerging managers.',
    event_year: 2027,
    start_date: '2027-09-14T00:00:00.000Z',
    end_date: '2027-09-16T00:00:00.000Z',
    application_end_date: '2027-07-31T23:59:59.000Z',
    status: 'Inactive',
    is_active: false,
    email_settings: {
      use_custom_email: true,
      application_invitation_subject: 'Invitation to Global Summit 2027',
      application_invitation_body: 'Please complete your GP application for Global Summit 2027.',
      application_reminder_subject: 'Complete Your Global Summit 2027 Application',
      application_reminder_body: 'Please complete your pending application.',
      submission_confirmation_subject: 'Application Submitted Successfully',
      submission_confirmation_body: 'Thank you for submitting your application.',
    },
  },
];

async function seedEvents() {
  try {
    console.log('[Seed Events] Checking events in Supabase...');

    for (const eventData of dummyEvents) {
      const { data: existing } = await supabase
        .from('events')
        .select('id')
        .eq('name', eventData.name)
        .maybeSingle();

      if (!existing) {
        await supabase.from('events').insert(eventData);
        console.log(`[Seed Events] Created event: ${eventData.name}`);
      } else {
        console.log(`[Seed Events] Event already exists: ${eventData.name}`);
      }
    }

    console.log('[Seed Events] Completed successfully.');
  } catch (error) {
    console.error('[Seed Events Error]', error);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

seedEvents();
