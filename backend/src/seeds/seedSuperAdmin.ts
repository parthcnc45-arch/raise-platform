import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';
import { seedRoles } from './seedRoles.js';

export interface SeedSuperAdminOptions {
  name?: string;
  email?: string;
  password?: string;
}

export async function seedSuperAdmin(options?: SeedSuperAdminOptions) {
  const name = options?.name || process.env.SUPER_ADMIN_NAME || 'Super Admin';
  const email = (
    options?.email ||
    process.env.SUPER_ADMIN_EMAIL ||
    'superadmin@raise.com'
  ).toLowerCase().trim();
  const rawPassword =
    options?.password || process.env.SUPER_ADMIN_PASSWORD || 'Admin@12345';

  try {
    // 1. Ensure all default roles are present in the roles table
    const roleMap = await seedRoles();

    // 2. Fetch the super_admin role from Supabase
    let superAdminRole = roleMap.get('super_admin');
    if (!superAdminRole) {
      const { data: roleData } = await supabase
        .from('roles')
        .select('*')
        .eq('code', 'super_admin')
        .maybeSingle();
      superAdminRole = roleData;
    }

    if (!superAdminRole) {
      throw new Error("Default 'super_admin' role not found in database.");
    }

    // 3. Find if Super Admin already exists in Supabase
    const { data: existingAdmin, error: fetchError } = await supabase
      .from('users')
      .select('id, email, role_id')
      .or(`email.eq.${email},role_id.eq.${superAdminRole.id}`)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('[Seed Error] Failed to query existing Super Admin:', fetchError);
    }

    if (existingAdmin) {
      if (existingAdmin.role_id !== superAdminRole.id) {
        await supabase
          .from('users')
          .update({ role_id: superAdminRole.id })
          .eq('id', existingAdmin.id);
        console.log(`[Seed] Updated Super Admin role reference to: ${superAdminRole.name}`);
      } else {
        console.log(`[Seed] Super Admin already exists with email: ${existingAdmin.email}`);
      }
      return existingAdmin;
    }

    // 4. Hash password and create new Super Admin in Supabase
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const { data: superAdmin, error: insertError } = await supabase
      .from('users')
      .insert({
        name,
        email,
        password: hashedPassword,
        role_id: superAdminRole.id,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    console.log('[Seed] Default Super Admin successfully created in Supabase:');
    console.log(`       - Name: ${superAdmin.name}`);
    console.log(`       - Email: ${superAdmin.email}`);
    console.log(`       - Role ID: ${superAdmin.role_id}`);

    return superAdmin;
  } catch (error) {
    console.error('[Seed Error] Failed to seed default Super Admin:', error);
    throw error;
  }
}
