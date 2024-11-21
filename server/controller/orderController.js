const { Order } = require("../models/order");
const { Product } = require("../models/product");

exports.createOrder = async (req, res, next) => {
    console.log("Order Create route hit");
    try {
        const {
            shippingInfo,
            orderItems,
            paymentMethod,
            paymentInfo,
            itemsPrice,
            shippingCharges,
            totalAmount,
        } = req.body;

        // If shippingInfo is not provided or invalid, set it to null
        const finalShippingInfo = shippingInfo ? shippingInfo : null;

        // Check product stock before creating the order
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product || product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: "Insufficient stock for one or more items",
                });
            }
        }

        // Create the order with finalShippingInfo (which could be null)
        const order = await Order.create({
            user: req.user._id,
            shippingInfo: finalShippingInfo, // Here shippingInfo could be null
            orderItems,
            paymentMethod,
            paymentInfo,
            itemsPrice,
            shippingCharges,
            totalAmount,
        });

        // Update product stock after the order is placed
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            product.stock -= item.quantity;
            await product.save();
        }

        // Log the created order for debugging
        console.log('Created Order:', order);

        // Return the response with success and order details
        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            orderId: order._id,  // Return the created order's ID
            order,  // Optionally return the whole order object
        });
    } catch (error) {
        // Log the error and return an error response
        console.error('Error creating order:', error);
        return res.status(400).json({
            success: false,
            message: "Error creating order: " + error.message,
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
        next(error); // Pass any error to the error handling middleware
    }
};

exports.getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id });
        res.status(200).json({
            success: true,
            orders,
        });
    } catch (error) {
        next(error); // Pass any error to the error handling middleware
    }
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
        next(error); // Pass any error to the error handling middleware
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

        const newStatus = req.body.status; // Get the new status from the request body

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
