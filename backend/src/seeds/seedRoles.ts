import Role, { IRole } from '../models/Role.js';

export const DEFAULT_ROLES = [
  {
    name: 'Super Admin',
    code: 'super_admin',
    description: 'Full system access with all administrative privileges',
    permissions: ['*'],
    isSystem: true,
    isActive: true,
  },
  {
    name: 'Admin',
    code: 'admin',
    description: 'Administrative access to manage users and applications',
    permissions: ['manage_users', 'view_reports', 'manage_applications'],
    isSystem: true,
    isActive: true,
  },
  {
    name: 'User',
    code: 'user',
    description: 'Standard platform user access',
    permissions: ['view_profile', 'submit_applications'],
    isSystem: true,
    isActive: true,
  },
];

export async function seedRoles(): Promise<Map<string, IRole>> {
  try {
    const roleMap = new Map<string, IRole>();

    for (const roleData of DEFAULT_ROLES) {
      const role = await Role.findOneAndUpdate(
        { code: roleData.code },
        {
          $setOnInsert: {
            name: roleData.name,
            code: roleData.code,
            description: roleData.description,
            permissions: roleData.permissions,
            isSystem: roleData.isSystem,
            isActive: roleData.isActive,
          },
        },
        { upsert: true, returnDocument: 'after' }
      );

      roleMap.set(role.code, role);
    }

    console.log(
      `[Seed] Roles verified (${DEFAULT_ROLES.map((r) => r.code).join(', ')})`
    );
    return roleMap;
  } catch (error) {
    console.error('[Seed Error] Failed to seed roles:', error);
    throw error;
  }
}
