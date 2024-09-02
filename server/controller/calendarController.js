const CalendarEvent = require('../models/calendar'); 

// Create a new calendar event
exports.createEvent = async (req, res) => {
    const { date, title, description, startDate, endDate, image } = req.body;

    try {
        const newEvent = new CalendarEvent({
            date,
            title,
            description,
            startDate,
            endDate,
           
            image
        });

        await newEvent.save();

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: newEvent
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create event'
        });
    }
    
};

// Update an existing calendar event
exports.updateEvent = async (req, res) => {
    const eventId = req.params.id;
    const { date, title, description, startDate, endDate, image } = req.body;

    try {
        const updatedEvent = await CalendarEvent.findByIdAndUpdate(
            eventId,
            { date, title, description, startDate, endDate, image },
            { new: true, runValidators: true }
        );

        if (!updatedEvent) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Event updated successfully',
            data: updatedEvent
        });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update event'
        });
    }
};


// Get a single event by ID
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


// Delete an event by ID
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



