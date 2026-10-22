import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Event from '../models/Event.js';
import GpApplication from '../models/GpApplication.js';

export const getEvents = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const startIndex = (page - 1) * limit;

    const totalRecords = await Event.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit);

    const events = await Event.find(query)
      .skip(startIndex)
      .limit(limit)
      .sort({ created_at: -1 });

    const formattedEvents = events.map((event: any) => ({
      id: event._id,
      name: event.name,
      event_year: event.event_year,
      status: event.status,
      start_date: event.start_date,
      end_date: event.end_date,
      is_active: event.is_active,
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

    if (!start_date) {
      return res.status(400).json({
        success: false,
        message: 'Start date is required',
      });
    }

    if (!end_date) {
      return res.status(400).json({
        success: false,
        message: 'End date is required',
      });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid start_date or end_date format',
      });
    }

    if (endDate < startDate) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date',
      });
    }

    // 2. Generate slug
    let baseSlug = customSlug
      ? customSlug.toString().toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      : name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    if (!baseSlug) {
      baseSlug = `event-${Date.now()}`;
    }

    // Ensure unique slug
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await Event.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 3. Fallbacks for optional fields
    const eventYear = Number(event_year) || startDate.getFullYear();

    let eventStatus: 'Active' | 'Inactive' = 'Active';
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
      eventStatus = matched;
    }

    // 4. Create new event
    const newEvent = await Event.create({
      name: name.trim(),
      slug: uniqueSlug,
      description: description?.trim() || '',
      event_year: eventYear,
      start_date: startDate,
      end_date: endDate,
      status: eventStatus,
      is_active: eventStatus === 'Active',
    });

    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: newEvent,
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

    if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format',
      });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: event,
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

    // 1. Validate ObjectId
    if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format',
      });
    }

    // 2. Check if event exists
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // 3. Validations for provided fields

    // Name validation
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
      event.name = name.trim();
    }

    // Description validation
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
      event.description = description.trim();
    }

    // Status validation
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
      event.status = matched;
      event.is_active = matched === 'Active';
    }

    // Date validations
    let newStartDate = event.start_date;
    let newEndDate = event.end_date;

    if (start_date !== undefined) {
      const parsedStart = new Date(start_date);
      if (isNaN(parsedStart.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid start_date format',
        });
      }
      newStartDate = parsedStart;
      event.start_date = newStartDate;
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
      event.end_date = newEndDate;
    }

    if (newEndDate < newStartDate) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date',
      });
    }

    // Event Year validation
    if (event_year !== undefined) {
      const parsedYear = Number(event_year);
      if (isNaN(parsedYear) || parsedYear < 1900 || parsedYear > 2100) {
        return res.status(400).json({
          success: false,
          message: 'Event year must be a valid 4-digit year',
        });
      }
      event.event_year = parsedYear;
    } else if (start_date !== undefined) {
      event.event_year = newStartDate.getFullYear();
    }

    // Slug validation and uniqueness
    if (customSlug !== undefined) {
      let formattedSlug = customSlug
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

      const slugExists = await Event.findOne({
        slug: formattedSlug,
        _id: { $ne: id },
      });
      if (slugExists) {
        return res.status(400).json({
          success: false,
          message: 'An event with this slug already exists',
        });
      }
      event.slug = formattedSlug;
    }

    // 4. Save and return updated event
    const updatedEvent = await event.save();

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent,
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

    // 1. Validate ObjectId
    if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format',
      });
    }

    // 2. Check if event exists
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // 3. Prevent deletion if any active applications are linked to this event
    const applicationCount = await GpApplication.countDocuments({
      event: id,
      deleted_at: null,
    });

    if (applicationCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete event because it has ${applicationCount} active application(s) linked to it`,
      });
    }

    // 4. Delete the event from database
    await Event.findByIdAndDelete(id);

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
