import mongoose, { Document, Schema } from 'mongoose';

export interface IGpApplication extends Document {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  event: mongoose.Types.ObjectId;
  status: 'pending' | 'successful' | 'failed' | 'resended';
  magic_token?: string;
  magic_link?: string;
  magic_link_accessed: boolean;
  magic_link_first_accessed_at: Date | null;
  magic_link_last_accessed_at: Date | null;
  magic_link_access_count: number;
  access_logs?: {
    ip_address: string;
    browser: string;
    os: string;
    device: string;
    accessed_at: Date;
  }[];
  deleted_at: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const gpApplicationSchema = new Schema<IGpApplication>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    company: { type: String, required: true },
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    status: {
      type: String,
      enum: ['pending', 'successful', 'failed', 'resended'],
      default: 'pending',
    },
    magic_token: { type: String, unique: true, sparse: true },
    magic_link: { type: String },
    magic_link_accessed: { type: Boolean, default: false },
    magic_link_first_accessed_at: { type: Date, default: null },
    magic_link_last_accessed_at: { type: Date, default: null },
    magic_link_access_count: { type: Number, default: 0 },
    access_logs: [
      {
        ip_address: { type: String },
        browser: { type: String },
        os: { type: String },
        device: { type: String },
        accessed_at: { type: Date, default: Date.now },
      }
    ],
    deleted_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export default mongoose.model<IGpApplication>('GpApplication', gpApplicationSchema);
