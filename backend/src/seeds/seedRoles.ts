import { supabase } from '../config/supabase.js';
import { Role } from '../types/role.js';

export const DEFAULT_ROLES = [
  {
    name: 'Super Admin',
    code: 'super_admin',
    is_system: true,
    is_active: true,
  },
  {
    name: 'Admin',
    code: 'admin',
    is_system: true,
    is_active: true,
  },
  {
    name: 'User',
    code: 'user',
    is_system: true,
    is_active: true,
  },
];

export async function seedRoles(): Promise<Map<string, Role>> {
  try {
    const roleMap = new Map<string, Role>();

    for (const roleData of DEFAULT_ROLES) {
      // Check if role already exists in Supabase
      const { data: existingRole, error: fetchError } = await supabase
        .from('roles')
        .select('*')
        .eq('code', roleData.code)
        .maybeSingle();

      if (fetchError) {
        console.error(`[Seed Error] Failed to check role ${roleData.code}:`, fetchError);
        continue;
      }

      if (existingRole) {
        roleMap.set(existingRole.code, existingRole as Role);
      } else {
        const { data: newRole, error: insertError } = await supabase
          .from('roles')
          .insert(roleData)
          .select()
          .single();

        if (insertError) {
          console.error(`[Seed Error] Failed to insert role ${roleData.code}:`, insertError);
        } else if (newRole) {
          roleMap.set(newRole.code, newRole as Role);
        }
      }
    }

    console.log(`[Seed] Roles verified (${DEFAULT_ROLES.map((r) => r.code).join(', ')})`);
    return roleMap;
  } catch (error) {
    console.error('[Seed Error] Failed to seed roles:', error);
    throw error;
  }
}
