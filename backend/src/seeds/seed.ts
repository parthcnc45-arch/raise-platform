import 'dotenv/config';
import { supabase } from '../config/supabase.js';
import { seedSuperAdmin } from './seedSuperAdmin.js';

async function runSeed() {
  try {
    console.log('[Seed Runner] Verifying Supabase connection...');
    const { error } = await supabase.from('roles').select('id').limit(1);
    if (error) {
      console.warn('[Seed Runner] Supabase connection check warning:', error.message);
    } else {
      console.log('[Seed Runner] Supabase connected successfully.');
    }

    console.log('[Seed Runner] Seeding Super Admin and Roles...');
    await seedSuperAdmin();
    console.log('[Seed Runner] Seeding completed successfully.');
  } catch (error) {
    console.error('[Seed Runner Error] Seeding failed:', error);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

runSeed();
