import mongoose, { Document, Schema } from 'mongoose';

export interface IEmailSettings {
  use_custom_email: boolean;
  application_invitation_subject: string;
  application_invitation_body: string;
  application_reminder_subject: string;
  application_reminder_body: string;
  submission_confirmation_subject: string;
  submission_confirmation_body: string;
}

export interface IEvent extends Document {
  name: string;
  slug: string;
  description?: string;
  event_year: number;
  start_date: Date;
  end_date: Date;
  application_start_date: Date;
  application_end_date: Date;
  status: 'draft' | 'published' | 'completed' | 'archived' | 'active' | 'closed';
  is_active: boolean;
  email_settings: IEmailSettings;
  createdAt: Date;
  updatedAt: Date;
}

const emailSettingsSchema = new Schema<IEmailSettings>({
  use_custom_email: { type: Boolean, default: false },
  application_invitation_subject: { type: String, default: '' },
  application_invitation_body: { type: String, default: '' },
  application_reminder_subject: { type: String, default: '' },
  application_reminder_body: { type: String, default: '' },
  submission_confirmation_subject: { type: String, default: '' },
  submission_confirmation_body: { type: String, default: '' },
}, { _id: false });

const eventSchema = new Schema<IEvent>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    event_year: { type: Number, required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    application_start_date: { type: Date, required: true },
    application_end_date: { type: Date, required: true },
    status: {
      type: String,
      enum: ['draft', 'published', 'completed', 'archived', 'active', 'closed'],
      default: 'draft',
    },
    is_active: { type: Boolean, default: true },
    email_settings: { type: emailSettingsSchema, default: () => ({}) },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export default mongoose.model<IEvent>('Event', eventSchema);
