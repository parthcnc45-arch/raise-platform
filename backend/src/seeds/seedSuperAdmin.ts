import User from '../models/User.js';
import Role from '../models/Role.js';
import { seedRoles } from './seedRoles.js';

export interface SeedSuperAdminOptions {
  name?: string;
  email?: string;
  password?: string;
}

export async function seedSuperAdmin(options?: SeedSuperAdminOptions) {
  const name =
    options?.name || process.env.SUPER_ADMIN_NAME || 'Super Admin';
  const email = (
    options?.email ||
    process.env.SUPER_ADMIN_EMAIL ||
    'superadmin@raise.com'
  ).toLowerCase().trim();
  const password =
    options?.password || process.env.SUPER_ADMIN_PASSWORD || 'Admin@12345';

  try {
    // 1. Ensure all default roles are present in the roles table
    await seedRoles();

    // 2. Fetch the super_admin role from roles collection
    const superAdminRole = await Role.findOne({ code: 'super_admin' });
    if (!superAdminRole) {
      throw new Error("Default 'super_admin' role not found in database.");
    }

    // 3. Find if Super Admin already exists by email or assigned super_admin role
    const existingAdmin = await User.findOne({
      $or: [{ email }, { role: superAdminRole._id }],
    });

    if (existingAdmin) {
      // Ensure the role reference is mapped correctly to the Role ObjectId
      if (
        !existingAdmin.role ||
        existingAdmin.role.toString() !== superAdminRole._id.toString()
      ) {
        existingAdmin.role = superAdminRole._id;
        await existingAdmin.save();
        console.log(
          `[Seed] Updated Super Admin role reference to: ${superAdminRole.name} (${superAdminRole._id})`
        );
      } else {
        console.log(
          `[Seed] Super Admin already exists with email: ${existingAdmin.email} (Role ID: ${existingAdmin.role})`
        );
      }
      return existingAdmin;
    }

    // 4. Create new Super Admin with role ObjectId mapped
    const superAdmin = await User.create({
      name,
      email,
      password,
      role: superAdminRole._id,
      isActive: true,
    });

    console.log('[Seed] Default Super Admin successfully created:');
    console.log(`       - Name: ${superAdmin.name}`);
    console.log(`       - Email: ${superAdmin.email}`);
    console.log(`       - Role: ${superAdminRole.name} (Code: ${superAdminRole.code}, ID: ${superAdminRole._id})`);
    console.log(`       - Password: (Set from config / default)`);

    return superAdmin;
  } catch (error) {
    console.error('[Seed Error] Failed to seed default Super Admin:', error);
    throw error;
  }
}
