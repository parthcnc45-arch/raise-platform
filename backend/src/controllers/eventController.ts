import { Request, Response } from 'express';
import Event from '../models/Event.js';

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
