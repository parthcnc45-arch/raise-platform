import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const formatEventDate = (date: Date | string): string => {
  try {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return String(date);
  }
};

export const getEvents = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1;

    let query = supabase
      .from('events')
      .select('*', { count: 'exact' });

    if (search.trim()) {
      query = query.or(`name.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`);
    }

    const { data: events, count, error } = await query
      .order('created_at', { ascending: false })
      .range(startIndex, endIndex);

    if (error) {
      console.error('Error fetching events from Supabase:', error);
      return res.status(500).json({ success: false, message: error.message || 'Failed to fetch events' });
    }

    const totalRecords = count || 0;
    const totalPages = Math.ceil(totalRecords / limit);

    const formattedEvents = (events || []).map((event: any) => ({
      id: event.id,
      _id: event.id,
      name: event.name,
      slug: event.slug,
      description: event.description,
      event_year: event.event_year,
      status: event.status,
      start_date: event.start_date,
      end_date: event.end_date,
      is_active: event.is_active,
      created_at: event.created_at,
      updated_at: event.updated_at,
    }));

    res.status(200).json({
      success: true,
      data: formattedEvents,
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalRecords,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error('Error fetching events:', error);
    res.status(500).json({ success: false, message: error?.message || 'Failed to fetch events' });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const {
      name,
      slug: customSlug,
      description,
      event_year,
      start_date,
      end_date,
      status,
    } = req.body;

    // 1. Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Event name is required',
      });
    }

    if (name.trim().length < 2 || name.trim().length > 25) {
      return res.status(400).json({
        success: false,
        message: 'Event name must be between 2 and 25 characters',
      });
    }

    if (description !== undefined && typeof description === 'string' && description.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Description cannot exceed 50 characters',
      });
    }

    const normalizedStatus = (status || 'Active').trim();
    const matchedStatus = (['Active', 'Inactive'] as const).find(
      (s) => s.toLowerCase() === normalizedStatus.toLowerCase()
    );
    if (!matchedStatus) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed values: Active, Inactive',
      });
    }

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Both start_date and end_date are required',
      });
    }

    const parsedStartDate = new Date(start_date);
    const parsedEndDate = new Date(end_date);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format for start_date or end_date',
      });
    }

    if (parsedEndDate < parsedStartDate) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date',
      });
    }

    // 2. Date Overlap check for Active events
    if (matchedStatus === 'Active') {
      const checkEndDate = new Date(parsedEndDate);
      if (typeof end_date === 'string' && end_date.length === 10) {
        checkEndDate.setUTCHours(23, 59, 59, 999);
      }

      const { data: overlappingEvents } = await supabase
        .from('events')
        .select('name, start_date, end_date')
        .eq('status', 'Active')
        .lte('start_date', checkEndDate.toISOString())
        .gte('end_date', parsedStartDate.toISOString())
        .limit(1);

      if (overlappingEvents && overlappingEvents.length > 0) {
        const overlap = overlappingEvents[0];
        const startStr = formatEventDate(overlap.start_date);
        const endStr = formatEventDate(overlap.end_date);
        return res.status(400).json({
          success: false,
          message: `Event dates overlap with an existing active event: "${overlap.name}" (${startStr} to ${endStr})`,
        });
      }
    }

    // 3. Event Year
    let parsedYear = Number(event_year);
    if (!event_year || isNaN(parsedYear) || parsedYear < 1900 || parsedYear > 2100) {
      parsedYear = parsedStartDate.getFullYear();
    }

    // 4. Slug generation
    let finalSlug: string;
    if (customSlug && typeof customSlug === 'string' && customSlug.trim()) {
      finalSlug = customSlug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    } else {
      finalSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    if (!finalSlug) finalSlug = 'event';

    // Ensure unique slug
    let uniqueSlug = finalSlug;
    let counter = 1;
    while (true) {
      const { data: existing } = await supabase
        .from('events')
        .select('id')
        .eq('slug', uniqueSlug)
        .maybeSingle();

      if (!existing) break;
      uniqueSlug = `${finalSlug}-${counter}`;
      counter++;
    }

    // 5. Insert event
    const { data: newEvent, error: insertError } = await supabase
      .from('events')
      .insert({
        name: name.trim(),
        slug: uniqueSlug,
        description: description ? description.trim() : '',
        event_year: parsedYear,
        start_date: parsedStartDate.toISOString(),
        end_date: parsedEndDate.toISOString(),
        status: matchedStatus,
        is_active: matchedStatus === 'Active',
      })
      .select('*')
      .single();

    if (insertError || !newEvent) {
      console.error('Error inserting event into Supabase:', insertError);
      return res.status(500).json({
        success: false,
        message: insertError?.message || 'Failed to create event',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: {
        ...newEvent,
        _id: newEvent.id,
      },
    });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to create event',
    });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof id !== 'string' || !UUID_REGEX.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format',
      });
    }

    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching event by ID:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...event,
        _id: event.id,
      },
    });
  } catch (error: any) {
    console.error('Error fetching event by ID:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to fetch event',
    });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug: customSlug,
      description,
      event_year,
      start_date,
      end_date,
      status,
    } = req.body;

    // 1. Validate UUID
    if (typeof id !== 'string' || !UUID_REGEX.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format',
      });
    }

    // 2. Fetch existing event
    const { data: event, error: fetchError } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Event name cannot be empty',
        });
      }
      if (name.trim().length < 2 || name.trim().length > 25) {
        return res.status(400).json({
          success: false,
          message: 'Event name must be between 2 and 25 characters',
        });
      }
      updates.name = name.trim();
    }

    if (description !== undefined) {
      if (typeof description !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Description must be a string',
        });
      }
      if (description.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Description cannot exceed 50 characters',
        });
      }
      updates.description = description.trim();
    }

    let targetStatus = event.status;
    if (status !== undefined) {
      const normalizedStatus = String(status).trim();
      const matched = (['Active', 'Inactive'] as const).find(
        (s) => s.toLowerCase() === normalizedStatus.toLowerCase()
      );
      if (!matched) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Allowed values: Active, Inactive',
        });
      }
      targetStatus = matched;
      updates.status = matched;
      updates.is_active = matched === 'Active';
    }

    let newStartDate = new Date(event.start_date);
    let newEndDate = new Date(event.end_date);

    if (start_date !== undefined) {
      const parsedStart = new Date(start_date);
      if (isNaN(parsedStart.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid start_date format',
        });
      }
      newStartDate = parsedStart;
      updates.start_date = newStartDate.toISOString();
    }

    if (end_date !== undefined) {
      const parsedEnd = new Date(end_date);
      if (isNaN(parsedEnd.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid end_date format',
        });
      }
      newEndDate = parsedEnd;
      updates.end_date = newEndDate.toISOString();
    }

    if (newEndDate < newStartDate) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date',
      });
    }

    // Overlap check
    if (targetStatus === 'Active') {
      const checkEndDate = new Date(newEndDate);
      if (typeof end_date === 'string' && end_date.length === 10) {
        checkEndDate.setUTCHours(23, 59, 59, 999);
      }

      const { data: overlappingEvents } = await supabase
        .from('events')
        .select('name, start_date, end_date')
        .neq('id', id)
        .eq('status', 'Active')
        .lte('start_date', checkEndDate.toISOString())
        .gte('end_date', newStartDate.toISOString())
        .limit(1);

      if (overlappingEvents && overlappingEvents.length > 0) {
        const overlap = overlappingEvents[0];
        const startStr = formatEventDate(overlap.start_date);
        const endStr = formatEventDate(overlap.end_date);
        return res.status(400).json({
          success: false,
          message: `Event dates overlap with an existing active event: "${overlap.name}" (${startStr} to ${endStr})`,
        });
      }
    }

    if (event_year !== undefined) {
      const parsedYear = Number(event_year);
      if (isNaN(parsedYear) || parsedYear < 1900 || parsedYear > 2100) {
        return res.status(400).json({
          success: false,
          message: 'Event year must be a valid 4-digit year',
        });
      }
      updates.event_year = parsedYear;
    } else if (start_date !== undefined) {
      updates.event_year = newStartDate.getFullYear();
    }

    if (customSlug !== undefined) {
      const formattedSlug = customSlug
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      if (!formattedSlug) {
        return res.status(400).json({
          success: false,
          message: 'Invalid slug provided',
        });
      }

      const { data: slugExists } = await supabase
        .from('events')
        .select('id')
        .eq('slug', formattedSlug)
        .neq('id', id)
        .maybeSingle();

      if (slugExists) {
        return res.status(400).json({
          success: false,
          message: 'An event with this slug already exists',
        });
      }
      updates.slug = formattedSlug;
    }

    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (updateError || !updatedEvent) {
      console.error('Error updating event in Supabase:', updateError);
      return res.status(500).json({
        success: false,
        message: updateError?.message || 'Failed to update event',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: {
        ...updatedEvent,
        _id: updatedEvent.id,
      },
    });
  } catch (error: any) {
    console.error('Error updating event:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to update event',
    });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof id !== 'string' || !UUID_REGEX.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format',
      });
    }

    const { data: event, error: fetchError } = await supabase
      .from('events')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if active applications linked to this event
    const { count: applicationCount } = await supabase
      .from('gp_applications')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', id)
      .is('deleted_at', null);

    if ((applicationCount || 0) > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete event because it has ${applicationCount} active application(s) linked to it`,
      });
    }

    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting event from Supabase:', deleteError);
      return res.status(500).json({
        success: false,
        message: deleteError.message || 'Failed to delete event',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
      data: { id },
    });
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to delete event',
    });
  }
};
