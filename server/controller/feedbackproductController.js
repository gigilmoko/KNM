const ProductFeedback = require('../models/productfeedback');
const Order = require('../models/order');  // Assuming the path is correct

exports.createProductFeedback = async (req, res, next) => {
    try {
        const { rating, feedback, productId, orderId, userId } = req.body;

        // Ensure all required fields are provided
        if (!rating || !productId || !orderId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Rating, product ID, order ID, and user ID are required.'
            });
        }

        // Find the order to check if the user purchased the product
        const order = await Order.findOne({
            _id: orderId,
            user: userId, // Ensure the order belongs to the provided userId
            'orderItems.product': productId, // Ensure the product is in the order's items
        });

        // If the order is not found, return an error
        if (!order) {
            return res.status(400).json({
                success: false,
                message: 'You must have purchased this product to leave feedback.'
            });
        }

        // Create new feedback
        const newProductFeedback = await ProductFeedback.create({
            userId, // Use the provided userId for feedback
            productId,
            orderId,
            rating,
            feedback
        });

        res.status(201).json({
            success: true,
            message: 'Product feedback submitted successfully.',
            feedback: newProductFeedback
        });
    } catch (error) {
        next(error);
    }
};

exports.getProductFeedbacks = async (req, res, next) => {
    try {
        const { productId } = req.params; // Get the productId from request params

        // Ensure productId is provided
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required.'
            });
        }

        // Find all feedbacks related to the productId
        const feedbacks = await ProductFeedback.find({ productId });

        // If no feedbacks are found
        if (!feedbacks || feedbacks.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No feedbacks found for this product.'
            });
        }

        // Return the feedbacks
        res.status(200).json({
            success: true,
            feedbacks
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllProductFeedbacks = async (req, res, next) => {

    
    try {
      // Find all feedbacks from the ProductFeedback collection
      const feedbacks = await ProductFeedback.find()
        .populate('userId', 'firstName lastName email') // Populate user details (optional)
        .populate('productId', 'name description price') // Populate product details (optional)
  
      // If no feedbacks are found
      if (!feedbacks || feedbacks.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No feedbacks found for any products.',
        });
      }
  
      // Return all feedbacks
      res.status(200).json({
        success: true,
        feedbacks,
      });
    } catch (error) {
      next(error);
    }
  };