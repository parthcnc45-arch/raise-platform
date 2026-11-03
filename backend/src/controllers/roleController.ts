import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const getRoles = async (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string) || '';
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    let query = supabase.from('roles').select('*', { count: 'exact' });

    if (search.trim()) {
      query = query.or(
        `name.ilike.%${search.trim()}%,code.ilike.%${search.trim()}%`
      );
    }

    query = query.order('created_at', { ascending: true });

    if (page && limit) {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit - 1;
      query = query.range(startIndex, endIndex);
    }

    const { data: roles, count, error } = await query;

    if (error) {
      console.error('Error fetching roles from Supabase:', error);
      return res.status(500).json({ success: false, message: error.message || 'Failed to fetch roles' });
    }

    return res.status(200).json({
      success: true,
      count: roles?.length || 0,
      totalRecords: count || roles?.length || 0,
      data: roles || [],
    });
  } catch (error: any) {
    console.error('Error in getRoles:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to fetch roles',
    });
  }
};

export const getRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof id !== 'string' || !UUID_REGEX.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role ID format',
      });
    }

    const { data: role, error } = await supabase
      .from('roles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching role by ID:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error: any) {
    console.error('Error in getRoleById:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to fetch role',
    });
  }
};

