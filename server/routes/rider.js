const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, isAuthenticatedRider, authorizeRoles, isAdmin } = require('../middlewares/auth');

const { getRider, newRider, getSingleRider, deleteRider, updateRider, 
    riderLogin, riderProfile, riderLogout, updatePassword, getPendingTruck,
    riderAvailable, riderUnavilable, avatarUpdate, updateRiderLocation } = require('../controller/riderController');


    // Place the route for logging in a rider before the routes that expect an ObjectId
router.get('/rider/logout', riderLogout);
router.get('/rider/profile', isAuthenticatedRider, riderProfile);
router.post('/rider/login', riderLogin);
router.post('/rider/new', isAuthenticatedUser, isAdmin, newRider);
router.get('/riders', getRider);
router.get('/delivery-session/riders/available', riderAvailable);
router.get('/delivery-session/riders/unavailable', riderUnavilable);
router.get('/rider/get-work/:id',  getPendingTruck);
router.get('/rider/:id', getSingleRider);
router.delete('/rider/delete/:id', isAuthenticatedUser, isAdmin, deleteRider);
router.put('/rider/update/:id', isAuthenticatedUser, isAdmin, updateRider);

router.put('/rider/update-location', updateRiderLocation);
router.put('/rider/update/password/:riderId', updatePassword);
router.put('/rider/avatar-update/:id', avatarUpdate);

module.exports = router;