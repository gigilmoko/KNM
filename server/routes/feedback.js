const express = require('express');
const router = express.Router();

const { newFeedback, getAllFeedback } = require('../controller/feedbackController');
const { isAuthenticatedUser } = require('../middlewares/auth');

router.post('/feedback/new', isAuthenticatedUser, newFeedback);
router.get('/feedback/all', getAllFeedback);

module.exports = router;
