const express = require('express');
const router = express.Router();
const { expressInterest } = require('../controller/userInterestController'); // Adjust the path accordingly
const { isAuthenticatedUser } = require('../middlewares/auth');
// Route to express interest in an event

router.post('/interested', isAuthenticatedUser, expressInterest);

module.exports = router;
