const express = require('express');
const router = express.Router();
const { isAuthenticatedUser } = require('../middlewares/auth');

const { 
    createOrder, 
    getAdminOrders, 
    getMyOrders, 
    getOrderDetails, 
    processOrder,
    getDemandForecast,
    getMarketBasketAnalysis,
    getTopProducts,
    getSeasonalityAnalysis,
    getPeakOrderHours,
    gcashPayment

} = require("../controller/orderController");

router.post('/neworder', isAuthenticatedUser, createOrder);
router.post('/gcash-payment/:token/:id', isAuthenticatedUser, gcashPayment);
// router.post('/grabpay-payment/:token/:id', isAuthenticatedUser, grabpayPayment);

router.get("/my", isAuthenticatedUser, getMyOrders);
router.get("/orders/list", getAdminOrders);
router.route("/orders/single/:id")
    .get(getOrderDetails)

router.put("/orders/update/:id", processOrder)
router.get('/predictions/demand-forecast',getDemandForecast)
router.get('/predictions/market-basket',getMarketBasketAnalysis)
router.get('/predictions/get-top-products',getTopProducts)
router.get('/predictions/get-seasonality',getSeasonalityAnalysis)
router.get('/predictions/get-peak-hours',getPeakOrderHours)
module.exports = router;
