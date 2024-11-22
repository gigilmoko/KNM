const express = require('express');
const router = express.Router();
const { expressInterest, getUserInterest, getAllInterestedUsers } = require('../controller/userInterestController'); // Adjust the path accordingly
const { isAuthenticatedUser } = require('../middlewares/auth');

router.get('/interested/:userId/:eventId', isAuthenticatedUser, getUserInterest);
router.post('/interested', isAuthenticatedUser, expressInterest);
router.get('/interested/:eventId', isAuthenticatedUser, getAllInterestedUsers);

module.exports = router;
