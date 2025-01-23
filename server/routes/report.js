const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, isAdmin } = require('../middlewares/auth');
const { getRevenueReport, getOrderReports, getUserReports, getMemberReports } = require('../controller/reportController');

router.get('/revenue-report', isAuthenticatedUser, isAdmin, getRevenueReport);
router.get('/order-reports', isAuthenticatedUser, isAdmin, getOrderReports);
router.get('/user-reports', isAuthenticatedUser, isAdmin, getUserReports);
router.get('/member-reports', isAuthenticatedUser, isAdmin, getMemberReports);

module.exports = router;