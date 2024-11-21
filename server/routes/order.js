const express = require('express');
const router = express.Router();
const { 
    createOrder, 
    getAdminOrders, 
    getMyOrders, 
    getOrderDetails, 
    processOrder 
} = require("../controller/orderController");

router.post("/new", createOrder);
router.get("/my", getMyOrders);
router.get("/admin", getAdminOrders);
router.route("/single/:id")
    .get(getOrderDetails)
    .put(processOrder);

module.exports = router;
