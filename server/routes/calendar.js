const express = require('express');
const router = express.Router();

const { isAuthenticatedUser } = require('../middlewares/auth');
const { createEvent, updateEvent, getEvent, getAllEvents, deleteEvent } = require('../controller/calendarController');

// Create a new event
router.post('/calendar/event', createEvent);

// Update an existing event
router.put('/calendar/event/:id', updateEvent);

// Get a single event by ID
router.get('/calendar/event/:id', getEvent);

// Get all events
router.get('/calendar/events', getAllEvents);

// Delete an event by ID
router.delete('/calendar/event/:id', deleteEvent);

router.get('/calendar/events', getAllEvents); // New route for fetching all events

module.exports = router;
