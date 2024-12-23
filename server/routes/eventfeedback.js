const express = require('express');
const { createFeedback, getEventFeedback } = require('../controller/feedbackEventController'); // Assuming this is the path to your controller


const router = express.Router();


router.post('/event/feedback/new', createFeedback);
router.get('/event/feedback/:eventId', getEventFeedback);

module.exports = router;
