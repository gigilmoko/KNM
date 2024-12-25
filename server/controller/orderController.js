const Order = require("../models/order");
const Product = require("../models/product");
const axios = require('axios'); 
const moment = require('moment-timezone');
const _ = require("lodash");

exports.createOrder = async (req, res, next) => {
    console.log("Received createOrder request");
    console.log("Request body:", req.body);

    const {
        userId,
        shippingInfo,
        orderItems,
        paymentMethod,
        itemsPrice,
        shippingCharges,
        totalAmount,
    } = req.body;

    try {
        // Check stock for each item
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product || product.stock < item.quantity) {
                console.log(`Insufficient stock for product ID: ${item.product}`);
                return res.status(400).json({
                    success: false,
                    message: "Insufficient stock for one or more items",
                });
            }
        }

        // Create order in the database
        const order = await Order.create({
            user: userId,
            shippingInfo,
            orderItems,
            paymentMethod,
            itemsPrice,
            shippingCharges,
            totalAmount,
        });

        console.log("Created Order:", order);

        // Update stock for each item
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            product.stock -= item.quantity;
            await product.save();
        }

        // If payment method is GCash, create a payment intent with PayMongo
        if (paymentMethod === "GCash") {
            try {
                const response = await axios.post(
                    'https://api.paymongo.com/v1/payment_intents',
                    {
                        data: {
                            attributes: {
                                amount: totalAmount * 100, // Amount in centavos
                                payment_method_allowed: ["gcash"],
                                currency: "PHP",
                                description: `Order #${order._id}`,
                            }
                        }
                    },
                    {
                        headers: {
                            Authorization: `Basic ${Buffer.from('sk_live_9y5MhqFpVhEJZpCtPGuPMiVD').toString('base64')}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                console.log("PayMongo Payment Intent:", response.data);

                const paymentIntentId = response.data.data.id;

                // Create a payment method for GCash
                const paymentMethodResponse = await axios.post(
                    'https://api.paymongo.com/v1/payment_methods',
                    {
                        data: {
                            attributes: {
                                type: "gcash",
                                details: {
                                    phone: user.phone, // Assuming user phone is available
                                },
                            },
                        },
                    },
                    {
                        headers: {
                            Authorization: `Basic ${Buffer.from('sk_live_9y5MhqFpVhEJZpCtPGuPMiVD').toString('base64')}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                console.log("PayMongo Payment Method:", paymentMethodResponse.data);

                const paymentMethodId = paymentMethodResponse.data.data.id;

                // Attach the payment method to the payment intent
                const attachResponse = await axios.post(
                    `https://api.paymongo.com/v1/payment_intents/${paymentIntentId}/attach`,
                    {
                        data: {
                            attributes: {
                                payment_method: paymentMethodId,
                            },
                        },
                    },
                    {
                        headers: {
                            Authorization: `Basic ${Buffer.from('sk_live_9y5MhqFpVhEJZpCtPGuPMiVD').toString('base64')}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                console.log("PayMongo Attach Payment Method:", attachResponse.data);

                const checkoutUrl = attachResponse.data.data.attributes.next_action.redirect.url;

                res.status(201).json({
                    success: true,
                    message: "Order Placed Successfully",
                    order,
                    checkoutUrl,
                });
            } catch (error) {
                console.error("PayMongo Error:", error.response ? error.response.data : error.message);
                return res.status(500).json({
                    success: false,
                    message: "Failed to create payment intent",
                });
            }
        } else {
            res.status(201).json({
                success: true,
                message: "Order Placed Successfully",
                order,
            });
        }
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create order",
        });
    }
};

exports.getAdminOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({});
        res.status(200).json({
            success: true,
            orders,
        });
    } catch (error) {
        next(error); 
    }
};

exports.getMyOrders = async (req, res, next) => {

    
    const orders = await Order.find({ user: req.user._id });
    
    res.status(200).json({
        success: true,
        orders,
    });
};

exports.getOrderDetails = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order Not Found",
            });
        }
        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        next(error); 
    }
};

exports.processOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order Not Found",
            });
        }

        const newStatus = req.body.status; 

        if (newStatus === "Shipped" && order.orderStatus === "Preparing") {
            order.orderStatus = newStatus;
        } else if (newStatus === "Delivered" && order.orderStatus === "Shipped") {
            order.orderStatus = newStatus;
            order.deliveredAt = new Date(Date.now());
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid Status Update",
            });
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: "Order Processed Successfully",
        });
    } catch (error) {
        next(error); 
    }
};

exports.getDemandForecast = async (req, res) => {
    try {
      // Fetch all orders
      const orders = await Order.find();
  
      // Initialize an empty object to store sales data by month
      const salesData = {};
  
      // Loop through each order
      orders.forEach((order) => {
        order.orderItems.forEach((item) => {
          // Format date as YYYY-MM (month-year format)
          const month = moment(order.createdAt).format("YYYY-MM");
  
          const productId = item.product.toString(); // Get the product ID
  
          // Initialize the sales data for the product and month if it doesn't exist
          if (!salesData[month]) {
            salesData[month] = {};
          }
          if (!salesData[month][productId]) {
            salesData[month][productId] = 0;
          }
  
          // Accumulate the quantity for the product for the given month
          salesData[month][productId] += item.quantity;
        });
      });
  
      // Prepare the response with top 3 products for each month
      const sortedData = {};
  
      Object.keys(salesData).forEach((month) => {
        // Sort products by quantity in descending order and pick top 3
        const sortedProducts = Object.entries(salesData[month])
          .sort(([, a], [, b]) => b - a) // Sort by quantity (highest first)
          .slice(0, 3) // Pick top 3 products
          .map(([productId, quantity]) => ({ productId, quantity }));
  
        sortedData[month] = sortedProducts;
      });
  
      res.status(200).json({
        success: true,
        salesData: sortedData,
      });
    } catch (error) {
      console.error("Error in demand forecasting:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };
   
  exports.getMarketBasketAnalysis = async (req, res) => {
    try {
      const orders = await Order.find({});
  
      const itemPairs = {};
      orders.forEach((order) => {
        const items = order.orderItems.map((item) => item.product.toString());
        for (let i = 0; i < items.length; i++) {
          for (let j = i + 1; j < items.length; j++) {
            const pair = [items[i], items[j]].sort().join("-");
            itemPairs[pair] = (itemPairs[pair] || 0) + 1;
          }
        }
      });
  
      const sortedPairs = Object.entries(itemPairs).sort(([, a], [, b]) => b - a);
  
      res.status(200).json({
        success: true,
        frequentPairs: sortedPairs,
      });
    } catch (error) {
      console.error("Error in market basket analysis:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };
  
  exports.getTopProducts = async (req, res) => {
    try {
      const orders = await Order.find({});
  
      const productSales = {};
      orders.forEach((order) => {
        order.orderItems.forEach((item) => {
          const productId = item.product.toString();
          productSales[productId] = (productSales[productId] || 0) + item.quantity;
        });
      });
  
      const sortedProducts = Object.entries(productSales).sort(([, a], [, b]) => b - a);
      const topProducts = await Promise.all(
        sortedProducts.slice(0, 5).map(async ([productId, quantity]) => {
          const product = await Product.findById(productId);
          return { product, quantity };
        })
      );
  
      res.status(200).json({
        success: true,
        topProducts,
      });
    } catch (error) {
      console.error("Error in product popularity analysis:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };
  
  exports.getSeasonalityAnalysis = async (req, res) => {
    try {
      const { productId } = req.params;
      const orders = await Order.find({ "orderItems.product": productId });
  
      const seasonalityData = orders.reduce((acc, order) => {
        const month = moment(order.createdAt).format("MMMM");
        order.orderItems.forEach((item) => {
          if (item.product.toString() === productId) {
            acc[month] = (acc[month] || 0) + item.quantity;
          }
        });
        return acc;
      }, {});
  
      res.status(200).json({
        success: true,
        seasonalityData,
      });
    } catch (error) {
      console.error("Error in seasonality analysis:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };
  
  exports.getPeakOrderHours = async (req, res) => {
    try {
      // Fetch all orders
      const orders = await Order.find();
  
      // Initialize an object to store order count by hour (in Philippines time)
      const hourlyOrders = {};
  
      // Iterate through the orders and convert `createdAt` time to Philippines time
      orders.forEach((order) => {
        const orderTimeInPhilippines = moment(order.createdAt)
          .tz('Asia/Manila', true) // Convert to Philippines time
          .format('YYYY-MM-DD HH:00'); // Format time to hour-level (YYYY-MM-DD HH:00)
  
        // Count orders by the hour
        if (!hourlyOrders[orderTimeInPhilippines]) {
          hourlyOrders[orderTimeInPhilippines] = 0;
        }
        hourlyOrders[orderTimeInPhilippines] += 1; // Increment order count for this hour
      });
  
      // Convert the hourly orders object to an array of entries (key, value)
      const sortedOrders = Object.entries(hourlyOrders)
        .sort(([timeA, countA], [timeB, countB]) => countB - countA); // Sort by order count (descending)
  
      // Get the top 3 peak hours with most orders
      const peakHours = sortedOrders.slice(0, 3).map(([hour, count]) => ({
        hour,
        orderCount: count,
      }));
  
      res.status(200).json({
        success: true,
        peakHours,
      });
    } catch (error) {
      console.error("Error in peak order hours:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };

