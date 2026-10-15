import type mongoose from 'mongoose';

export interface DatabaseStatus {
  state: number;
  status: string;
  isConnected: boolean;
  host: string | null;
  name: string | null;
}

export function connectDatabase(): Promise<typeof mongoose>;
export function disconnectDatabase(): Promise<void>;
export function getDatabaseStatus(): DatabaseStatus;
export { mongoose };
