const Order = require('../models/order');
const User = require('../models/user');
const Product = require('../models/product'); // Adjust the path as necessary

const createOrder = async (req, res) => {
    try {
        const { userId, orderItems, paymentType, paidAt, totalPrice, orderStatus } = req.body;

        // Validate request body
        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'Order items are required' });
        }

        // Fetch the user's information from their profile
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate stock for each order item
        for (const item of orderItems) {
            const product = await Product.findById(item._id);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found`,
                });
            }

            if (!product.portion && item.quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient stock for product: ' + product.name,
                });
            }
        }

        // Deduct stock for each order item
        for (const item of orderItems) {
            const product = await Product.findById(item._id);

            if (!product.portion) {
                product.stock -= item.quantity;
                await product.save();
            }
        }

        const newOrderItems = orderItems.map(item => ({
            ...item,
            product: item._id,
            status: 'Paid',
        }));

        // Create a new order instance
        const order = new Order({
            user: {
                id: user._id,
                name: `${user.fname} ${user.lname}`,
                address: user.address
            },
            orderItems: newOrderItems,
            paymentType,
            paidAt,
            totalPrice,
            orderStatus
        });

        // Save the order to the database
        const createdOrder = await order.save();

        // Return a response to the client
        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createOrder
};