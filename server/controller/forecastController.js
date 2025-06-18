const Forecast = require('../models/forecast');

// Create a new forecast
exports.createForecast = async (req, res) => {
    try {
        const { year, month, index } = req.body;
        const forecast = new Forecast({ year, month, index });
        await forecast.save();
        res.status(201).json({ success: true, forecast });
    } catch (error) {
        console.error('Error creating forecast:', error);
        res.status(500).json({ success: false, message: 'Error creating forecast', error: error.message });
    }
};

// Get all forecasts
exports.getForecasts = async (req, res) => {
    try {
        const forecasts = await Forecast.find();
        res.status(200).json({ success: true, forecasts });
    } catch (error) {
        console.error('Error fetching forecasts:', error);
        res.status(500).json({ success: false, message: 'Error fetching forecasts', error: error.message });
    }
};

// Get a single forecast by ID
exports.getSingleForecast = async (req, res) => {
    try {
        const forecast = await Forecast.findById(req.params.id);
        if (!forecast) {
            return res.status(404).json({ success: false, message: 'Forecast not found' });
        }
        res.status(200).json({ success: true, forecast });
    } catch (error) {
        console.error('Error fetching forecast:', error);
        res.status(500).json({ success: false, message: 'Error fetching forecast', error: error.message });
    }
};

// Update a forecast by ID
exports.updateForecast = async (req, res) => {
    try {
        const { year, month, index } = req.body;
        const forecast = await Forecast.findByIdAndUpdate(
            req.params.id,
            { year, month, index },
            { new: true }
        );
        if (!forecast) {
            return res.status(404).json({ success: false, message: 'Forecast not found' });
        }
        res.status(200).json({ success: true, forecast });
    } catch (error) {
        console.error('Error updating forecast:', error);
        res.status(500).json({ success: false, message: 'Error updating forecast', error: error.message });
    }
};

// Delete a forecast by ID
exports.deleteForecast = async (req, res) => {
    try {
        const forecast = await Forecast.findByIdAndDelete(req.params.id);
        if (!forecast) {
            return res.status(404).json({ success: false, message: 'Forecast not found' });
        }
        res.status(200).json({ success: true, message: 'Forecast deleted successfully' });
    } catch (error) {
        console.error('Error deleting forecast:', error);
        res.status(500).json({ success: false, message: 'Error deleting forecast', error: error.message });
    }
};