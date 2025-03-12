const express = require('express');
const { createFeedback, getEventFeedback, getEventFeedbackMobile,  getAllReviews, getAllFeedbackEvents } = require('../controller/feedbackEventController'); // Assuming this is the path to your controller


const router = express.Router();

router.get('/event/feedback/all', getAllFeedbackEvents);
router.post('/event/feedback/new', createFeedback);
router.get('/event/feedback/:eventId', getEventFeedback);
router.get('/event/feedback/:eventId/mobile', getEventFeedbackMobile);



module.exports = router;
