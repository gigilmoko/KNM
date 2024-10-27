require('dotenv').config();
const axios = require('axios');
const Order = require('../models/order');
const User = require('../models/user');
const Product = require('../models/product'); // Adjust the path as necessary
const { encode: btoa } = require('base-64');

// Function to create a payment intent with PayMongo
const createPaymentIntent = async (amount) => {
    const response = await axios.post('https://api.paymongo.com/v1/payment_intents', {
        data: {
            attributes: {
                amount: amount * 100, // Amount in centavos
                payment_method_allowed: ['gcash', 'paymaya'],
                currency: 'PHP'
            }
        }
    }, {
        headers: {
            'Authorization': `Basic ${btoa(process.env.PAYMONGO_SECRET_KEY + ':')}`,
            'Content-Type': 'application/json'
        }
    });

    return response.data.data;
};

const createOrder = async (req, res) => {
    try {
        const { userId, orderItems, paymentType, totalPrice, paymentMethodId } = req.body;

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

        // Create a payment intent with PayMongo
        const paymentIntent = await createPaymentIntent(totalPrice);

        // Attach the payment method to the payment intent
        const attachPaymentResponse = await axios.post(`https://api.paymongo.com/v1/payment_intents/${paymentIntent.id}/attach`, {
            data: {
                attributes: {
                    payment_method: paymentMethodId
                }
            }
        }, {
            headers: {
                'Authorization': `Basic ${btoa(process.env.PAYMONGO_SECRET_KEY + ':')}`,
                'Content-Type': 'application/json'
            }
        });

        const payment = attachPaymentResponse.data.data;

        if (payment.attributes.status !== 'succeeded') {
            return res.status(400).json({ message: 'Payment failed', payment });
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
            paidAt: new Date(),
            totalPrice,
            orderStatus: 'Processing',
            paymentInfo: {
                id: payment.id,
                status: payment.attributes.status
            }
        });

        // Save the order to the database
        const createdOrder = await order.save();

        // Return a response to the client
        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { createOrder };