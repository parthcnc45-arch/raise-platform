import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Role from '../models/Role.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Helper to resolve role by ObjectId, code, or name
const resolveRole = async (roleInput: any) => {
  if (!roleInput) return null;

  if (mongoose.Types.ObjectId.isValid(roleInput)) {
    const roleDoc = await Role.findById(roleInput);
    if (roleDoc) return roleDoc;
  }

  if (typeof roleInput === 'string') {
    const trimmed = roleInput.trim();
    const roleDoc = await Role.findOne({
      $or: [
        { code: trimmed.toLowerCase() },
        { name: { $regex: new RegExp(`^${trimmed}$`, 'i') } },
      ],
    });
    if (roleDoc) return roleDoc;
  }

  return null;
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const startIndex = (page - 1) * limit;

    const totalRecords = await User.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit);

    const users = await User.find(query)
      .populate({ path: 'role', select: 'name code' })
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });

    const formattedUsers = users.map((user: any) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role?.name || 'User',
      roleCode: user.role?.code || '',
      roleId: user.role?._id || user.role,
      status: user.isActive ? 'Active' : 'Inactive',
      isActive: user.isActive,
      phone: user.phone || '',
      createdAt: user.createdAt,
    }));

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

    if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
    }

    const user = await User.findById(id)
      .select('-password')
      .populate({ path: 'role', select: 'name code' });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: (user.role as any)?.name || 'User',
        roleCode: (user.role as any)?.code || '',
        roleId: (user.role as any)?._id || user.role,
        status: user.isActive ? 'Active' : 'Inactive',
        isActive: user.isActive,
        phone: user.phone || '',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
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

    if (password.length > 8) {
      return res.status(400).json({
        success: false,
        message: 'Password cannot exceed 8 characters',
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
    const existingUser = await User.findOne({ email: normalizedEmail });
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

    // 4. Create user
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: roleDoc._id,
      isActive: userIsActive,
      phone: typeof phone === 'string' ? phone.trim() : '',
    });

    await newUser.populate({ path: 'role', select: 'name code' });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: (newUser.role as any)?.name || 'User',
        roleCode: (newUser.role as any)?.code || '',
        roleId: (newUser.role as any)?._id || newUser.role,
        status: newUser.isActive ? 'Active' : 'Inactive',
        isActive: newUser.isActive,
        phone: newUser.phone || '',
        createdAt: newUser.createdAt,
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
    if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
    }

    // 2. Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

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
      user.name = name.trim();
    }

    if (email !== undefined) {
      if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
        return res.status(400).json({
          success: false,
          message: 'A valid email address is required',
        });
      }
      const normalizedEmail = email.toLowerCase().trim();
      if (normalizedEmail !== user.email) {
        const emailExists = await User.findOne({
          email: normalizedEmail,
          _id: { $ne: id },
        });
        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: 'Email is already in use by another user',
          });
        }
        user.email = normalizedEmail;
      }
    }

    if (password !== undefined && password !== '') {
      if (typeof password !== 'string' || password.length > 8) {
        return res.status(400).json({
          success: false,
          message: 'Password cannot exceed 8 characters',
        });
      }
      user.password = password;
    }

    if (role !== undefined) {
      const roleDoc = await resolveRole(role);
      if (!roleDoc) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role specified',
        });
      }
      user.role = roleDoc._id;
    }

    if (isActive !== undefined) {
      user.isActive = Boolean(isActive);
    } else if (status !== undefined) {
      user.isActive = String(status).toLowerCase() === 'active';
    }

    if (phone !== undefined) {
      user.phone = typeof phone === 'string' ? phone.trim() : '';
    }

    // 4. Save and return updated user
    await user.save();
    await user.populate({ path: 'role', select: 'name code' });

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: (user.role as any)?.name || 'User',
        roleCode: (user.role as any)?.code || '',
        roleId: (user.role as any)?._id || user.role,
        status: user.isActive ? 'Active' : 'Inactive',
        isActive: user.isActive,
        phone: user.phone || '',
        updatedAt: user.updatedAt,
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

    // 1. Validate ObjectId
    if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
    }

    // 2. Prevent self-deletion
    if (req.user && req.user._id && req.user._id.toString() === id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    // 3. Check if user exists
    const user = await User.findById(id).populate({ path: 'role', select: 'code' });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // 4. Prevent deleting the last Super Admin
    const userRoleCode = (user.role as any)?.code;
    if (userRoleCode === 'super_admin') {
      const superAdminRole = await Role.findOne({ code: 'super_admin' });
      if (superAdminRole) {
        const superAdminCount = await User.countDocuments({ role: superAdminRole._id });
        if (superAdminCount <= 1) {
          return res.status(400).json({
            success: false,
            message: 'Cannot delete the only Super Admin user in the system',
          });
        }
      }
    }

    // 5. Delete the user
    await User.findByIdAndDelete(id);

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
