const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles, isAdmin } = require('../middlewares/auth');

const { getTruck, newTruck, getSingleTruck, updateTruck,
    unassignRider, assignRider, deleteTruck, getTruckOrders, addTruckOrder,
     removeAllTruckOrders, removeSingleTruckOrder, declinedWork, acceptedWork,
    truckAvailable, truckUnavailable } = require('../controller/trucksController'); // Corrected path

router.get('/trucks', getTruck);
router.get('/delivery-session/truck/available', truckAvailable);
router.get('/delivery-session/truck/unavailable', truckUnavailable);
router.post('/truck/new', newTruck);
router.get('/truck/:id', getSingleTruck);
router.put('/truck/update/:id',  updateTruck);
router.delete('/truck/delete/:id', isAuthenticatedUser, isAdmin, deleteTruck);

module.exports = router;