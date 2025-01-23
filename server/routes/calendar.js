const express = require('express');
const router = express.Router();

const { isAuthenticatedUser } = require('../middlewares/auth');
const { createEvent, updateEvent, getEvent, getAllEvents, deleteEvent, afterCurrentDay, beforeCurrentDay, searchEvents, testNotifyMembers, testNotifyAllUsers  } = require('../controller/calendarController');

router.get('/calendar/event/search', searchEvents);
router.post('/calendar/event', isAuthenticatedUser, createEvent);
router.put('/calendar/event/:id', isAuthenticatedUser, updateEvent);
router.get('/calendar/event/:id', getEvent);
router.get('/calendar/events', getAllEvents);
router.delete('/calendar/event/:id', isAuthenticatedUser, deleteEvent);
router.get('/calendar/events/after', afterCurrentDay);
router.get('/calendar/events/before', beforeCurrentDay);

// Test routes
router.post('/calendar/notify/members', testNotifyMembers);
router.post('/calendar/notify/all', testNotifyAllUsers);

module.exports = router;
