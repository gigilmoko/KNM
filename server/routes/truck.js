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

// router.put('/truck/unassign/:id', isAuthenticatedUser, isAdmin, unassignRider);
// router.put('/truck/assign/:id', assignRider);
// router.get('/truck/:id/orders', isAuthenticatedUser, getTruckOrders);
// router.put('/truck/:id/addOrder/:orderId',   addTruckOrder);
// router.delete('/truck/:id/remove/allOrders',  removeAllTruckOrders);
// router.delete('/truck/:id/remove/:orderId', removeSingleTruckOrder);
// router.put('/truck/:id/order/accept/',   acceptedWork);
// router.put('/truck/:id/order/decline',   declinedWork);





// router.get('/trucks', getTruck);
// router.post('/truck/new',  newTruck);
// router.get('/truck/:id', getSingleTruck);
// router.put('/truck/update/:id',  updateTruck);
// router.put('/truck/unassign/:id', unassignRider);
// router.put('/truck/assign/:id', assignRider);
// router.delete('/truck/delete/:id',  deleteTruck);

module.exports = router;