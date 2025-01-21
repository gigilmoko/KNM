const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles, isAdmin } = require('../middlewares/auth');

const { getRider, newRider, getSingleRider, deleteRider, updateRider, 
    riderLogin, riderProfile, riderLogout, updatePassword, getPendingTruck } = require('../controller/riderController');

// Place the route for logging in a rider before the routes that expect an ObjectId
router.post('/rider/login', riderLogin);
router.post('/rider/new', isAuthenticatedUser, isAdmin, newRider);
router.get('/riders', getRider);
router.get('/rider/get-work/:id',  getPendingTruck);
router.get('/rider/:id', getSingleRider);
router.delete('/rider/delete/:id', isAuthenticatedUser, isAdmin, deleteRider);
router.put('/rider/update/:id', isAuthenticatedUser, isAdmin, updateRider);
router.get('/rider/me', isAuthenticatedUser, riderProfile);
router.get('/rider/logout', riderLogout);
router.put('/rider/update/password/:riderId', isAuthenticatedUser, isAdmin, updatePassword);


module.exports = router;