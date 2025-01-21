const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, isAdmin } = require('../middlewares/auth');
const { getDemandForecast } = require('../controller/forecastController');

router.get('/forecast', isAuthenticatedUser, isAdmin, getDemandForecast);
// router.post('/forecast', isAuthenticatedUser, isAdmin, createDemandForecast);

module.exports = router;