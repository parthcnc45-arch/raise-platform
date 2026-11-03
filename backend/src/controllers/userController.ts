import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Helper to resolve role by UUID, code, or name
const resolveRole = async (roleInput: any) => {
  if (!roleInput) return null;

  if (typeof roleInput === 'string' && UUID_REGEX.test(roleInput)) {
    const { data: roleDoc } = await supabase
      .from('roles')
      .select('*')
      .eq('id', roleInput)
      .maybeSingle();
    if (roleDoc) return roleDoc;
  }

  if (typeof roleInput === 'string') {
    const trimmed = roleInput.trim();
    const { data: roleDoc } = await supabase
      .from('roles')
      .select('*')
      .or(`code.eq.${trimmed.toLowerCase()},name.ilike.${trimmed}`)
      .maybeSingle();
    if (roleDoc) return roleDoc;
  }

  return null;
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1;

    let query = supabase
      .from('users')
      .select('id, name, email, is_active, phone, created_at, role:roles!role_id(id, name, code)', { count: 'exact' });

    if (search.trim()) {
      query = query.or(`name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`);
    }

    const { data: users, count, error } = await query
      .order('created_at', { ascending: false })
      .range(startIndex, endIndex);

    if (error) {
      console.error('Error fetching users from Supabase:', error);
      return res.status(500).json({ success: false, message: error.message || 'Failed to fetch users' });
    }

    const totalRecords = count || 0;
    const totalPages = Math.ceil(totalRecords / limit);

    const formattedUsers = (users || []).map((user: any) => {
      const roleObj = Array.isArray(user.role) ? user.role[0] : user.role;
      return {
        id: user.id,
        _id: user.id,
        name: user.name,
        email: user.email,
        role: roleObj?.name || 'User',
        roleCode: roleObj?.code || '',
        roleId: roleObj?.id || '',
        status: user.is_active ? 'Active' : 'Inactive',
        isActive: user.is_active,
        phone: user.phone || '',
        createdAt: user.created_at,
      };
    });

    res.status(200).json({
      success: true,
      data: formattedUsers,
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalRecords,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: error?.message || 'Failed to fetch users' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof id !== 'string' || !UUID_REGEX.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, is_active, phone, avatar, created_at, updated_at, role:roles!role_id(id, name, code)')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user by ID:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const roleObj = Array.isArray(user.role) ? user.role[0] : user.role;

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        _id: user.id,
        name: user.name,
        email: user.email,
        role: roleObj?.name || 'User',
        roleCode: roleObj?.code || '',
        roleId: roleObj?.id || '',
        status: user.is_active ? 'Active' : 'Inactive',
        isActive: user.is_active,
        phone: user.phone || '',
        avatar: user.avatar || '',
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Error fetching user by ID:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to fetch user',
    });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, status, isActive, phone } = req.body;

    // 1. Input validations
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    if (name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 2 and 100 characters',
      });
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required',
      });
    }

    if (!password || typeof password !== 'string' || !password.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
      });
    }

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role is required',
      });
    }

    const roleDoc = await resolveRole(role);
    if (!roleDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified',
      });
    }

    // 2. Email uniqueness check
    const normalizedEmail = email.toLowerCase().trim();
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    // 3. Determine active status
    let userIsActive = true;
    if (isActive !== undefined) {
      userIsActive = Boolean(isActive);
    } else if (status !== undefined) {
      userIsActive = String(status).toLowerCase() === 'active';
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create user in Supabase
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role_id: roleDoc.id,
        is_active: userIsActive,
        phone: typeof phone === 'string' ? phone.trim() : '',
      })
      .select('id, name, email, is_active, phone, created_at, role:roles!role_id(id, name, code)')
      .single();

    if (insertError || !newUser) {
      console.error('Error inserting user into Supabase:', insertError);
      return res.status(500).json({
        success: false,
        message: insertError?.message || 'Failed to create user',
      });
    }

    const roleObj = Array.isArray(newUser.role) ? newUser.role[0] : newUser.role;

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: newUser.id,
        _id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: roleObj?.name || 'User',
        roleCode: roleObj?.code || '',
        roleId: roleObj?.id || '',
        status: newUser.is_active ? 'Active' : 'Inactive',
        isActive: newUser.is_active,
        phone: newUser.phone || '',
        createdAt: newUser.created_at,
      },
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to create user',
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, status, isActive, phone } = req.body;

    // 1. Validate ID
    if (typeof id !== 'string' || !UUID_REGEX.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
    }

    // 2. Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    // 3. Validations & updates for provided fields
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Name cannot be empty',
        });
      }
      if (name.trim().length < 2 || name.trim().length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Name must be between 2 and 100 characters',
        });
      }
      updates.name = name.trim();
    }

    if (email !== undefined) {
      if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
        return res.status(400).json({
          success: false,
          message: 'A valid email address is required',
        });
      }
      const normalizedEmail = email.toLowerCase().trim();
      if (normalizedEmail !== existingUser.email) {
        const { data: emailExists } = await supabase
          .from('users')
          .select('id')
          .eq('email', normalizedEmail)
          .neq('id', id)
          .maybeSingle();

        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: 'Email is already in use by another user',
          });
        }
        updates.email = normalizedEmail;
      }
    }

    if (password !== undefined && password !== '') {
      updates.password = await bcrypt.hash(password, 10);
    }

    if (role !== undefined) {
      const roleDoc = await resolveRole(role);
      if (!roleDoc) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role specified',
        });
      }
      updates.role_id = roleDoc.id;
    }

    if (isActive !== undefined) {
      updates.is_active = Boolean(isActive);
    } else if (status !== undefined) {
      updates.is_active = String(status).toLowerCase() === 'active';
    }

    if (phone !== undefined) {
      updates.phone = typeof phone === 'string' ? phone.trim() : '';
    }

    // 4. Update and return user
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('id, name, email, is_active, phone, avatar, updated_at, role:roles!role_id(id, name, code)')
      .single();

    if (updateError || !updatedUser) {
      console.error('Error updating user in Supabase:', updateError);
      return res.status(500).json({
        success: false,
        message: updateError?.message || 'Failed to update user',
      });
    }

    const roleObj = Array.isArray(updatedUser.role) ? updatedUser.role[0] : updatedUser.role;

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: updatedUser.id,
        _id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: roleObj?.name || 'User',
        roleCode: roleObj?.code || '',
        roleId: roleObj?.id || '',
        status: updatedUser.is_active ? 'Active' : 'Inactive',
        isActive: updatedUser.is_active,
        phone: updatedUser.phone || '',
        updatedAt: updatedUser.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to update user',
    });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // 1. Validate UUID
    if (typeof id !== 'string' || !UUID_REGEX.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
    }

    // 2. Prevent self-deletion
    const currentUserId = req.user?.id || req.user?._id;
    if (currentUserId && String(currentUserId) === String(id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    // 3. Check if user exists with role
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, role:roles!role_id(code)')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // 4. Prevent deleting the last Super Admin
    const roleObj = Array.isArray(user.role) ? user.role[0] : user.role;
    if (roleObj?.code === 'super_admin') {
      const { data: superAdminRole } = await supabase
        .from('roles')
        .select('id')
        .eq('code', 'super_admin')
        .maybeSingle();

      if (superAdminRole) {
        const { count: superAdminCount } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .eq('role_id', superAdminRole.id);

        if ((superAdminCount || 0) <= 1) {
          return res.status(400).json({
            success: false,
            message: 'Cannot delete the only Super Admin user in the system',
          });
        }
      }
    }

    // 5. Delete the user
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting user from Supabase:', deleteError);
      return res.status(500).json({
        success: false,
        message: deleteError.message || 'Failed to delete user',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: { id },
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to delete user',
    });
  }
};
