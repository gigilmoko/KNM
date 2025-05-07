const Order = require('../models/order');
const Product = require('../models/product'); // Assuming a Product model exists
const Forecast = require('../models/forecast');
const moment = require('moment');

const calculateMovingAverage = (data, period) => {
    const result = [];
    for (let i = period - 1; i < data.length; i++) {
        const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
        result.push(sum / period);
    }
    return result;
};

const calculateExponentialSmoothing = (data, alpha) => {
    const result = [data[0]];
    for (let i = 1; i < data.length; i++) {
        result.push(alpha * data[i] + (1 - alpha) * result[i - 1]);
    }
    return result;
};

const calculateRegression = (data) => {
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i + 1);
    const y = data;

    const sumX = x.reduce((acc, val) => acc + val, 0);
    const sumY = y.reduce((acc, val) => acc + val, 0);
    const sumXY = x.reduce((acc, val, i) => acc + val * y[i], 0);
    const sumX2 = x.reduce((acc, val) => acc + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return x.map(xi => slope * xi + intercept);
};

exports.getDemandForecast = async (req, res) => {
    try {
        const { period = 'monthly', method = 'movingAverage' } = req.query;

        if (!['monthly', 'quarterly', 'yearly'].includes(period)) {
            return res.status(400).json({ success: false, message: "Invalid period parameter" });
        }

        if (!['movingAverage', 'exponentialSmoothing', 'regression'].includes(method)) {
            return res.status(400).json({ success: false, message: "Invalid method parameter" });
        }

        // Fetch all orders
        const orders = await Order.find().populate('orderProducts.product'); // Populate product details
        const salesData = {};

        // Aggregate sales data
        orders.forEach((order) => {
            if (order.orderProducts && order.orderProducts.length > 0) {
                order.orderProducts.forEach((item) => {
                    if (item.product) { // Ensure product is not null
                        const date = moment(order.createdAt);
                        const productId = item.product._id.toString();
                        const productName = item.product.name;

                        let periodKey;
                        if (period === 'monthly') {
                            periodKey = date.format('YYYY-MM');
                        } else if (period === 'quarterly') {
                            periodKey = `${date.year()}-Q${date.quarter()}`;
                        } else if (period === 'yearly') {
                            periodKey = date.format('YYYY');
                        }

                        if (!salesData[productId]) {
                            salesData[productId] = { name: productName, sales: {} };
                        }
                        if (!salesData[productId].sales[periodKey]) {
                            salesData[productId].sales[periodKey] = 0;
                        }

                        salesData[productId].sales[periodKey] += item.quantity;
                    }
                });
            }
        });

        // Calculate forecasts
        const forecastedData = [];
        for (const productId in salesData) {
            const { name, sales } = salesData[productId];
            const periods = Object.keys(sales).sort();
            const quantities = periods.map(periodKey => sales[periodKey]);

            if (quantities.length < 2) {
                forecastedData.push({
                    productName: name,
                    forecastedDemand: null,
                    percentageChange: null,
                    message: "Insufficient sales data for forecasting"
                });
                continue;
            }

            let forecast = [];
            if (method === 'movingAverage') {
                forecast = calculateMovingAverage(quantities, 3);
            } else if (method === 'exponentialSmoothing') {
                forecast = calculateExponentialSmoothing(quantities, 0.5);
            } else if (method === 'regression') {
                forecast = calculateRegression(quantities);
            }
            
            const forecastedDemand = forecast[forecast.length - 1] || 0;
            const lastActualDemand = quantities[quantities.length - 1] || 0;
            const percentageChange = lastActualDemand === 0
                ? null
                : ((forecastedDemand - lastActualDemand) / lastActualDemand) * 100;

            forecastedData.push({
                productName: name,
                forecastedDemand: Math.round(forecastedDemand),
                percentageChange: percentageChange !== null ? Math.round(percentageChange) : null
            });
        }

        res.status(200).json({
            success: true,
            forecastedData,
        });
    } catch (error) {
        console.error("Error fetching demand forecast:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Create a new forecast
exports.createForecast = async (req, res) => {
    console.log("create forecast called", req.body);
    try {
        const { productId, forecastedDemand, forecastDate } = req.body;

        const monthYear = new Date(forecastDate).toISOString().slice(0, 7); // Extract YYYY-MM
        const existingForecast = await Forecast.findOne({
            productId,
            forecastDate: { $gte: `${monthYear}-01`, $lt: `${monthYear}-31` },
        });

        if (existingForecast) {
            return res.status(400).json({ success: false, message: "Forecast for this product and month already exists" });
        }

        const forecast = new Forecast({ productId, forecastedDemand, forecastDate });
        await forecast.save();

        res.status(201).json({ success: true, forecast });
    } catch (error) {
        console.error("Error creating forecast:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Update an existing forecast
exports.updateForecast = async (req, res) => {
    try {
        const { id } = req.params;
        const { productId, forecastedDemand, forecastDate } = req.body;

        const monthYear = new Date(forecastDate).toISOString().slice(0, 7); // Extract YYYY-MM
        const existingForecast = await Forecast.findOne({
            _id: { $ne: id }, // Exclude the current forecast being updated
            productId,
            forecastDate: { $gte: `${monthYear}-01`, $lt: `${monthYear}-31` },
        });

        if (existingForecast) {
            return res.status(400).json({ success: false, message: "Forecast for this product and month already exists" });
        }

        const forecast = await Forecast.findByIdAndUpdate(
            id,
            { productId, forecastedDemand, forecastDate },
            { new: true }
        );

        if (!forecast) {
            return res.status(404).json({ success: false, message: "Forecast not found" });
        }

        res.status(200).json({ success: true, forecast });
    } catch (error) {
        console.error("Error updating forecast:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Delete a forecast
exports.deleteForecast = async (req, res) => {
    try {
        const { id } = req.params;

        const forecast = await Forecast.findByIdAndDelete(id);

        if (!forecast) {
            return res.status(404).json({ success: false, message: "Forecast not found" });
        }

        res.status(200).json({ success: true, message: "Forecast deleted successfully" });
    } catch (error) {
        console.error("Error deleting forecast:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Get all forecasts
exports.getAllForecasts = async (req, res) => {
    try {
        const forecasts = await Forecast.find().populate('productId');
        res.status(200).json({ success: true, forecasts });
    } catch (error) {
        console.error("Error fetching forecasts:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Get a single forecast
exports.getSingleForecast = async (req, res) => {
    console.log("single forcast touched")
    try {
        const { id } = req.params;

        const forecast = await Forecast.findById(id).populate('productId');

        if (!forecast) {
            return res.status(404).json({ success: false, message: "Forecast not found" });
        }

        res.status(200).json({ success: true, forecast });
    } catch (error) {
        console.error("Error fetching forecast:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};