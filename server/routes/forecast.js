const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, isAdmin } = require('../middlewares/auth');
const {
    getDemandForecast,
    createForecast,
    updateForecast,
    deleteForecast,
    getAllForecasts,
    getSingleForecast
} = require('../controller/forecastController');

router.get('/forecast/all', isAuthenticatedUser, isAdmin, getAllForecasts);
router.post('/forecast/create', isAuthenticatedUser, isAdmin, createForecast);
router.get('/forecast', isAuthenticatedUser, isAdmin, getDemandForecast);
router.get('/forecast/:id', isAuthenticatedUser, isAdmin, getSingleForecast);

router.put('/forecast/update/:id', isAuthenticatedUser, isAdmin, updateForecast);
router.delete('/forecast/delete/:id', isAuthenticatedUser, isAdmin, deleteForecast);


module.exports = router;