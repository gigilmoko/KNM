const Order  = require("../models/order");
const Product = require("../models/product");
const axios = require('axios'); 

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

        // If payment method is E-wallet, create a payment intent with PayMongo
        if (paymentMethod === "Ewallet") {
            try {
                const response = await axios.post(
                    'https://api.paymongo.com/v1/payment_intents',
                    {
                        data: {
                            attributes: {
                                amount: totalAmount * 100, // Amount in centavos
                                payment_method_allowed: ["gcash"],
                                payment_method_options: {
                                    card: {
                                        request_three_d_secure: "any"
                                    }
                                },
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
                            Authorization: `Basic ${Buffer.from('ssk_live_9y5MhqFpVhEJZpCtPGuPMiVD').toString('base64')}`,
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
                            Authorization: `Basic ${Buffer.from('sk_test_your_secret_key').toString('base64')}`,
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
