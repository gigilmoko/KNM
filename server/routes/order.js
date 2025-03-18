const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, isAdmin } = require('../middlewares/auth');

const { 
    createOrder, 
    deleteOrder,
    getAdminOrders, 
    getMyOrders, 
    getOrderDetails, 
    processOrder,
    getDemandForecast,
    getMarketBasketAnalysis,
    getTopProducts,
    getSeasonalityAnalysis,
    getPeakOrderHours,
    gcashPayment,
    calculateTotalPrice,
    getNumberOfOrders,
    getMonthlyOrderTotal,
    getLast7DaysOrderTotal,
    getDailyOrderTotalByInterval,
    getTotalCustomer,
    getOrderStatusCounts,
    getPreparingAndCancelledOrders,
    proofOfDeliveryConfirmed,
    proofOfDeliveryNotConfirmed,
    getPendingDeliveries, 
    getMyOrdersMobile,
    getLatestOrders,
    getAdminOrdersMobile

} = require("../controller/orderController");
const { get } = require('mongoose');

router.post('/neworder', isAuthenticatedUser, createOrder);
router.post('/gcash-payment/:token/:id', isAuthenticatedUser, gcashPayment);
router.delete('/orders/delete/:id',isAuthenticatedUser, isAdmin, deleteOrder);

router.get("/my", isAuthenticatedUser, getMyOrders);
router.get("/my/mobile", isAuthenticatedUser, getMyOrdersMobile);
router.get("/orders/list",  isAuthenticatedUser, getAdminOrders);
router.get("/orders/list/mobile",  isAuthenticatedUser, getAdminOrdersMobile);
router.route("/orders/single/:id")
    .get(getOrderDetails)
    
router.put("/orders/update/:id", processOrder)
router.get('/predictions/demand-forecast',isAuthenticatedUser, isAdmin,getDemandForecast)
router.get('/predictions/market-basket',isAuthenticatedUser, isAdmin,getMarketBasketAnalysis)
router.get('/predictions/get-top-products', getTopProducts)
router.get('/analytics/order-latest', getLatestOrders)
router.get('/predictions/get-seasonality',isAuthenticatedUser, isAdmin,getSeasonalityAnalysis)
router.get('/predictions/get-peak-hours',isAuthenticatedUser, isAdmin,getPeakOrderHours)
router.get('/analytics/orders/totalprice',isAuthenticatedUser, isAdmin,calculateTotalPrice)
router.get('/analytics/orders/quantity',isAuthenticatedUser, isAdmin,getNumberOfOrders)
router.get('/analytics/orders/months',isAuthenticatedUser, isAdmin,getMonthlyOrderTotal)
router.get('/analytics/orders/weekly',isAuthenticatedUser, isAdmin,getLast7DaysOrderTotal)
router.get('/analytics/orders/daily',isAuthenticatedUser, isAdmin, getDailyOrderTotalByInterval)
router.get('/analytics/orders/totalcustomers', isAuthenticatedUser, isAdmin, getTotalCustomer)
router.get('/orders/status/count',  isAuthenticatedUser, isAdmin, getOrderStatusCounts)
router.get('/truck/orders/preparing',   getPreparingAndCancelledOrders)
router.get('/orders/delivery-pending',   getPendingDeliveries)
router.put('/order/proof/:orderId/confirmed',proofOfDeliveryConfirmed)
router.put('/order/proof/:orderId/notconfirmed',proofOfDeliveryNotConfirmed)


module.exports = router;
