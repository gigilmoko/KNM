const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles, isAdmin } = require('../middlewares/auth');

const { getRider, newRider, getSingleRider, deleteRider, updateRider, 
    riderLogin, riderProfile, riderLogout, updatePassword} = require('../controller/riderController');

router.get('/riders',  getRider);    
router.post('/rider/new', isAuthenticatedUser, isAdmin, newRider);    
router.get('/rider/:id', getSingleRider);
router.delete('/rider/delete/:id',isAuthenticatedUser, isAdmin, deleteRider);
router.put('/rider/update/:id',  isAuthenticatedUser, isAdmin, updateRider);
router.post('/rider/login', riderLogin);
router.get('/rider/me', isAuthenticatedUser, riderProfile);
router.get('/rider/logout', riderLogout);
router.put('/rider/update/password/:riderId', isAuthenticatedUser, isAdmin, updatePassword);
module.exports = router;