const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles, isAdmin } = require('../middlewares/auth');

const { getTruck, newTruck, getSingleTruck, updateTruck,
    unassignRider, assignRider, deleteTruck, getTruckOrders, addTruckOrder,
     removeAllTruckOrders, removeSingleTruckOrder } = require('../controller/trucksController'); // Corrected path

router.get('/trucks', isAuthenticatedUser, isAdmin, getTruck);
router.post('/truck/new', isAuthenticatedUser, isAdmin, newTruck);
router.get('/truck/:id', isAuthenticatedUser, isAdmin, getSingleTruck);
router.put('/truck/update/:id', isAuthenticatedUser, isAdmin, updateTruck);
router.put('/truck/unassign/:id', isAuthenticatedUser, isAdmin, unassignRider);
router.put('/truck/assign/:id', isAuthenticatedUser, isAdmin, assignRider);
router.delete('/truck/delete/:id', isAuthenticatedUser, isAdmin, deleteTruck);
router.get('/truck/:id/orders', isAuthenticatedUser, getTruckOrders);
router.put('/truck/:id/addOrder',  isAuthenticatedUser, isAdmin, addTruckOrder);
router.delete('/truck/:id/remove/:id', isAuthenticatedUser, isAdmin, removeSingleTruckOrder);
router.delete('/truck/:id/remove/all', isAuthenticatedUser, isAdmin, removeAllTruckOrders);




// router.get('/trucks', getTruck);
// router.post('/truck/new',  newTruck);
// router.get('/truck/:id', getSingleTruck);
// router.put('/truck/update/:id',  updateTruck);
// router.put('/truck/unassign/:id', unassignRider);
// router.put('/truck/assign/:id', assignRider);
// router.delete('/truck/delete/:id',  deleteTruck);

module.exports = router;