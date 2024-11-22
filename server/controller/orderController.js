const  Order  = require("../models/order");
const  Product = require("../models/product");

exports.createOrder = async (req, res, next) => {
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

    for (const item of orderItems) {
        const product = await Product.findById(item.product);

        if (!product || product.stock < item.quantity) {
            return res.status(400).json({
                success: false,
                message: "Insufficient stock for one or more items",
            });
        }
    }

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
