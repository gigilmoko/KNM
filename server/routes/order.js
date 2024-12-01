const express = require('express');
const router = express.Router();
const { isAuthenticatedUser } = require('../middlewares/auth');

const { 
    createOrder, 
    getAdminOrders, 
    getMyOrders, 
    getOrderDetails, 
    processOrder 
} = require("../controller/orderController");

router.post('/neworder', createOrder);
router.get("/my", isAuthenticatedUser, getMyOrders);
router.get("/orders/list", getAdminOrders);
router.route("/single/:id")
    .get(getOrderDetails)

router.put("/orders/update/:id", processOrder)

module.exports = router;
