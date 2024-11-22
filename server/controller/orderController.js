const  Order  = require("../models/order");
const  Product = require("../models/product");
// const  User = require("../models/user");

exports.createOrder = async (req, res, next) => {
    console.log("Request body:", req.body); // Log the entire request body to check data

    const {
        userId, // Get the userId from the request body
        shippingInfo,
        orderItems,
        paymentMethod,
        itemsPrice,
        shippingCharges,
        totalAmount,
    } = req.body;

    // console.log("Shipping Info:", shippingInfo); // Log individual properties
    // console.log("Order Items:", orderItems);
    // console.log("Payment Method:", paymentMethod);
    // console.log("Items Price:", itemsPrice);
    // console.log("Shipping Charges:", shippingCharges);
    // console.log("Total Amount:", totalAmount);
    // console.log("User ID:", userId); // Log the user ID to make sure it’s passed correctly

    // Check product stock before creating the order
    for (const item of orderItems) {
        // console.log("Checking stock for item:", item.product);
        const product = await Product.findById(item.product);

        if (!product || product.stock < item.quantity) {
            return res.status(400).json({
                success: false,
                message: "Insufficient stock for one or more items",
            });
        }
    }

    const order = await Order.create({
        user: userId, // Use the userId passed from the frontend
        shippingInfo,
        orderItems,
        paymentMethod,
        itemsPrice,
        shippingCharges,
        totalAmount,
    });

    // Log the created order for debugging purposes
    console.log("Created Order:", order);

    // Update product stock
    for (const item of orderItems) {
        const product = await Product.findById(item.product);
        product.stock -= item.quantity;
        await product.save();
    }

    res.status(201).json({
        success: true,
        message: "Order Placed Successfully",
        order,
    });
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
