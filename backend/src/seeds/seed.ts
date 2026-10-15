import 'dotenv/config';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { seedSuperAdmin } from './seedSuperAdmin.js';

async function runSeed() {
  try {
    console.log('[Seed Runner] Connecting to database...');
    await connectDatabase();
    console.log('[Seed Runner] Seeding Super Admin...');
    await seedSuperAdmin();
    console.log('[Seed Runner] Seeding completed successfully.');
  } catch (error) {
    console.error('[Seed Runner Error] Seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
    process.exit();
  }
}

runSeed();
