const express = require('express');
const router = express.Router();
const { expressInterest, getUserInterest, getAllInterestedUsers, changeAttended, getUserInterestedAndAttended } = require('../controller/userInterestController'); // Adjust the path accordingly
const { isAuthenticatedUser } = require('../middlewares/auth');

router.get('/interested/:userId/:eventId', getUserInterest);
router.get('/interested-attended/:userId/:eventId', getUserInterestedAndAttended);
router.post('/interested', expressInterest);
router.get('/interested/:eventId', getAllInterestedUsers);
router.put('/event/change-attendance', changeAttended);
module.exports = router;