const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles, isAdmin } = require('../middlewares/auth');

const { createDeliverySession, getSessions, getSessionById,
    acceptWork, deleteDeliverySession, declineWork, completeDeliverySession,
    startDeliverySession, 
  
 } = require('../controller/deliverySessionController'); 

router.post('/delivery-session/new',  createDeliverySession);
router.get('/delivery-session/all', getSessions);
router.get('/delivery-session/:id',  getSessionById);
router.put('/delivery-session/:id/accept', acceptWork);
router.put('/delivery-session/:id/decline', declineWork); 
router.put('/delivery-session/:id/completed-work', completeDeliverySession); 
router.put('/delivery-session/:id/started-work', startDeliverySession); 
router.delete('/delivery-session/:id', deleteDeliverySession);  

module.exports = router;

