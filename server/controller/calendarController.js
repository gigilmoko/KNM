const CalendarEvent = require('../models/calendar');
const { createNotification } = require('./notificationController');
const User = require('../models/user');
const Notification = require('../models/notification');
const axios = require('axios');
const moment = require('moment-timezone');

// FOR TESTING ONLY
exports.testNotifyMembers = async (req, res) => {
    try {
        const members = await User.find({
            deviceToken: { $exists: true, $ne: null },
            role: 'member'  // Changed from applyMember to role
        });


        const playerIds = members.map(member => member.deviceToken).filter(Boolean);
        console.log('Found members with device tokens:', playerIds.length);


        if (playerIds.length > 0) {
            const response = await axios.post('https://onesignal.com/api/v1/notifications', {
                app_id: process.env.ONESIGNAL_APP_ID,
                include_player_ids: playerIds,
                contents: { en: "Test notification for members!" },
                headings: { en: "Member Notification" }
            }, {
                headers: {
                    'Authorization': `Basic ${process.env.ONESIGNAL_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('OneSignal Response:', response.data);
        }


        res.status(200).json({
            success: true,
            membersNotified: playerIds.length,
            members: members.map(m => ({ id: m._id, name: m.fname + ' ' + m.lname, role: m.role }))
        });
    } catch (error) {
        console.error('Notification Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};


exports.testNotifyAllUsers = async (req, res) => {
    try {
        const users = await User.find({
            deviceToken: { $exists: true, $ne: null }
        });


        const playerIds = users.map(user => user.deviceToken).filter(Boolean);
        console.log('Found users with device tokens:', playerIds.length);


        if (playerIds.length > 0) {
            const response = await axios.post('https://onesignal.com/api/v1/notifications', {
                app_id: process.env.ONESIGNAL_APP_ID,
                include_player_ids: playerIds,
                contents: { en: "Test notification for all users!" }
            }, {
                headers: {
                    'Authorization': `Basic ${process.env.ONESIGNAL_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('OneSignal Response:', response.data);
        }


        res.status(200).json({
            success: true,
            usersNotified: playerIds.length
        });
    } catch (error) {
        console.error('Notification Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};


exports.createEvent = async (req, res) => {
    const { date, title, description, startDate, endDate, image, location, audience } = req.body;
    console.log('req.body', req.body);

    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, message: 'Unauthorized: User not authenticated' });
    }

    try {
        // Convert startDate and endDate to Philippines time
        const startDateInPH = moment(startDate).tz('Asia/Manila').format();
        const endDateInPH = moment(endDate).tz('Asia/Manila').format();

        // Create the new event with converted dates
        const newEvent = new CalendarEvent({
            date,
            title,
            description,
            startDate: startDateInPH,
            endDate: endDateInPH,
            image,
            location,
            audience,
            user: req.user.id
        });

        await newEvent.save();
        console.log('Audience type:', audience);

        // Get users to notify based on audience
        let users;
        if (audience === 'all') {
            users = await User.find({ deviceToken: { $exists: true, $ne: null } });
            console.log('All users with device tokens:', users.length);
        } else {
            users = await User.find({
                deviceToken: { $exists: true, $ne: null },
                role: 'member'
            });
            console.log('Member users with device tokens:', users.length);
        }

        // Log found users
        console.log('Users found:', users.map(u => ({
            id: u._id,
            email: u.email,
            hasToken: !!u.deviceToken
        })));

        // Send push notification if there are users with device tokens
        if (playerIds.length > 0) {
            const notification = {
                app_id: process.env.ONESIGNAL_APP_ID,
                include_player_ids: playerIds,
                contents: {
                    en: `New event "${title}" scheduled from ${new Date(startDateInPH).toLocaleString()} to ${new Date(endDateInPH).toLocaleString()} at ${location}.`
                },
                headings: { en: "New Event Created" },
                data: { eventId: newEvent._id }
            };

            try {
                const response = await axios.post(
                    'https://onesignal.com/api/v1/notifications',
                    notification,
                    {
                        headers: {
                            'Authorization': `Basic ${process.env.ONESIGNAL_API_KEY}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                console.log('OneSignal Response:', response.data);
            } catch (notificationError) {
                console.error('Error sending push notification:', notificationError);
            }
        }

        // Create in-app notifications for users
        const notificationPromises = users.map(user => {
            return new Notification({
                user: user._id,
                event: newEvent._id,
                read: false
            }).save();
        });

        await Promise.all(notificationPromises);

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: newEvent,
            notifiedUsers: playerIds.length
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create event',
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


        // Send push notification using OneSignal
        const oneSignalNotification = {
            app_id: ONESIGNAL_APP_ID,
            included_segments: ["All"],
            headings: { en: `Event Updated: ${title}` },
            contents: { en: `The event "${title}" has been updated. Check details: Location - ${location}, Schedule - ${startDate} to ${endDate}.` },
            data: { eventId: updatedEvent._id },
        };


        try {
            const response = await axios.post(
                'https://onesignal.com/api/v1/notifications',
                oneSignalNotification,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${ONESIGNAL_API_KEY}`,
                    },
                }
            );
            console.log('OneSignal response:', response.data);
        } catch (error) {
            console.error('Error sending push notification:', error.response ? error.response.data : error.message);
        }


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

