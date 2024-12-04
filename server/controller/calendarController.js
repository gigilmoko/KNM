const CalendarEvent = require('../models/calendar');
const Notification = require('../models/notification');
const User = require('../models/user');
const { broadcast } = require('../utils/broadcast');

exports.createEvent = async (req, res) => {
    const { date, title, description, startDate, endDate, image, location, audience } = req.body;

    try {
        const newEvent = new CalendarEvent({
            date,
            title,
            description,
            startDate,
            endDate,
            image,
            location,
            audience,
        });

        await newEvent.save();

        const users = audience === 'all' 
            ? await User.find()
            : await User.find({ role: 'member' }); 

        const notificationPromises = users.map(async (user) => {
            return Notification.create({
                user: user._id,
                event: newEvent._id, 
                title: `New Event: ${title}`,
                description: `The event "${title}" is scheduled from ${startDate} to ${endDate} at ${location}.`,
                eventDate: startDate,
                read: false,
            });
        });

        const notifications = await Promise.all(notificationPromises);

        notifications.forEach((notification) => {
            broadcast({
                type: 'event-notification',
                user: notification.user,
                title: notification.title,
                description: notification.description,
                eventDate: notification.eventDate,
                read: notification.read,
            });
        });

        res.status(201).json({
            success: true,
            message: 'Event and notifications created successfully',
            data: newEvent,
            audience: audience, // Include the audience in the response
        });

    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create event and notifications',
            error: error.message
        });
    }
};

exports.updateEvent = async (req, res) => {
    const eventId = req.params.id;
    const { date, title, description, startDate, endDate, image, location, audience } = req.body;

    try {
        const updatedEvent = await CalendarEvent.findByIdAndUpdate(
            eventId,
            { date, title, description, startDate, endDate, image, location, audience },
            { new: true, runValidators: true }
        );

        if (!updatedEvent) {
            return res.status(404).json({
                success: false,
                message: 'Event not found',
            });
        }

        // Notify the target audience if necessary
        const users = audience === 'all' 
            ? await User.find() 
            : await User.find({ role: 'member' });

        const notificationPromises = users.map(async (user) => {
            return Notification.create({
                user: user._id,
                event: updatedEvent._id,
                title: `Event Updated: ${title}`,
                description: `The event "${title}" has been updated. Check details: Location - ${location}, Schedule - ${startDate} to ${endDate}.`,
                eventDate: startDate,
                read: false,
            });
        });

        await Promise.all(notificationPromises);

        res.status(200).json({
            success: true,
            message: 'Event updated successfully',
            data: updatedEvent,
        });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update event',
            error: error.message,
        });
    }
};

exports.getEvent = async (req, res) => {
    const eventId = req.params.id;

    try {
        const event = await CalendarEvent.findById(eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.status(200).json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch event'
        });
    }
};

exports.deleteEvent = async (req, res) => {
    const eventId = req.params.id;

    try {
        const deletedEvent = await CalendarEvent.findByIdAndDelete(eventId);

        if (!deletedEvent) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete event'
        });
    }
};

exports.getAllEvents = async (req, res) => {
    try {
        const events = await CalendarEvent.find(); // Fetch all events from the database

        res.status(200).json({
            success: true,
            data: events
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch events'
        });
    }
};

exports.beforeCurrentDay = async (req, res) => {
    try {
        // Get the current date in Hong Kong Time (PH Time, UTC+8)
        const currentDate = moment.tz('Asia/Hong_Kong').startOf('day'); // Start of the current day

        // Fetch events with date before current day
        const eventsBefore = await CalendarEvent.find({
            date: { $lt: currentDate.toDate() } // Only events before the current date
        });

        res.status(200).json({
            success: true,
            data: eventsBefore
        });
    } catch (error) {
        console.error('Error fetching events before current day:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch events before current day'
        });
    }
};

exports.afterCurrentDay = async (req, res) => {
    try {
        // Get the current date in Hong Kong Time (PH Time, UTC+8)
        const currentDate = moment.tz('Asia/Hong_Kong').startOf('day'); // Start of the current day

        // Fetch events with date after the current day
        const eventsAfter = await CalendarEvent.find({
            date: { $gt: currentDate.toDate() } // Only events after the current date
        });

        res.status(200).json({
            success: true,
            data: eventsAfter
        });
    } catch (error) {
        console.error('Error fetching events after current day:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch events after current day'
        });
    }
};

exports.searchEvents = async (req, res) => {
    const { keyword } = req.query;

    try {
        // Check if a keyword is provided
        if (!keyword) {
            return res.status(400).json({
                success: false,
                message: 'Keyword is required for searching events',
            });
        }

        // Perform the search query
        const events = await CalendarEvent.find({
            $or: [
                { title: { $regex: keyword, $options: 'i' } },       // Match title (case insensitive)
                { description: { $regex: keyword, $options: 'i' } } // Match description (case insensitive)
            ]
        });

        // Check if any events were found
        if (events.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No events found matching the keyword',
            });
        }

        // Return the search results
        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        console.error('Error searching events:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search events',
            error: error.message
        });
    }
};
