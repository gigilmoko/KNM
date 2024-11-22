const express = require('express');
const router = express.Router();

const { isAuthenticatedUser } = require('../middlewares/auth');
const { createEvent, updateEvent, getEvent, getAllEvents, deleteEvent, afterCurrentDay, beforeCurrentDay  } = require('../controller/calendarController');

router.post('/calendar/event', createEvent);
router.put('/calendar/event/:id', updateEvent);
router.get('/calendar/event/:id', getEvent);
router.get('/calendar/events', getAllEvents);
router.delete('/calendar/event/:id', deleteEvent);
router.get('/calendar/events/after', afterCurrentDay);
router.get('/calendar/events/before', beforeCurrentDay);

module.exports = router;
