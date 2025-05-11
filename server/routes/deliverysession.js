const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles, isAdmin } = require('../middlewares/auth');

const { createDeliverySession, getSessions, getSessionById,
    acceptWork, deleteDeliverySession, declineWork, completeDeliverySession,
    startDeliverySession, getGroupedDeliverySessions, getPendingSessionsByRider,
    getOngoingSessionsByRider, getSessionsByRiderId, submitProofDeliverySession,
    cancelOrder, getSessionByOrderId
    
  
 } = require('../controller/deliverySessionController'); 

router.post('/delivery-session/new',  createDeliverySession);
router.get('/delivery-session/all', getSessions);
router.get('/delivery-session/by-status', getGroupedDeliverySessions);
router.get('/delivery-session/:id',  getSessionById);
// router.put('/delivery-session/:id/accept', acceptWork);
// router.put('/delivery-session/:id/decline', declineWork); 
router.put('/delivery-session/:id/completed-work', completeDeliverySession); 
router.put('/delivery-session/:id/started-work', startDeliverySession); 
router.put('/delivery-session/:id/proof', submitProofDeliverySession);
router.put('/delivery-session/:id/cancel-order/:orderId', cancelOrder);
router.delete('/delivery-session/:id', deleteDeliverySession);  
router.get('/delivery-session/order/:orderId/', getSessionByOrderId);
router.get('/delivery-session/on-going/:riderId', getOngoingSessionsByRider);
router.get('/delivery-session/history/:riderId', getSessionsByRiderId);


module.exports = router;

