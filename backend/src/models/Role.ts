import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IRole extends Document {
  name: string;
  code: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
      minlength: [2, 'Role name must be at least 2 characters long'],
      maxlength: [50, 'Role name cannot exceed 50 characters'],
    },
    code: {
      type: String,
      required: [true, 'Role code is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    permissions: {
      type: [String],
      default: [],
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Role: Model<IRole> =
  mongoose.models.Role || mongoose.model<IRole>('Role', roleSchema);

export default Role;
