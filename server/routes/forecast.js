const express = require('express');
const router = express.Router();
const { createForecast, getForecasts, getSingleForecast, updateForecast, deleteForecast } = require('../controller/forecastController');
const { isAuthenticatedUser, isAdmin } = require('../middlewares/auth');

// Create a new forecast
router.post('/create', isAuthenticatedUser, isAdmin, createForecast);

// Get all forecasts
router.get('/get', isAuthenticatedUser, isAdmin, getForecasts);

// Get a single forecast by ID
router.get('/get/:id', isAuthenticatedUser, isAdmin, getSingleForecast);

// Update a forecast by ID
router.put('/update/:id', isAuthenticatedUser, isAdmin, updateForecast);

// Delete a forecast by ID
router.delete('/delete/:id', isAuthenticatedUser, isAdmin, deleteForecast);

module.exports = router;