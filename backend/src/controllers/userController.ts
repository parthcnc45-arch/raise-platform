import { Request, Response } from 'express';
import User from '../models/User.js';
import Role from '../models/Role.js';

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
      .populate({ path: 'role', select: 'name' })
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });

    const formattedUsers = users.map((user: any) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role?.name || 'User',
      status: user.isActive ? 'Active' : 'Inactive',
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
