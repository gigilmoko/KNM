const Order = require('../models/order');
const Product = require('../models/product'); // Assuming a Product model exists
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