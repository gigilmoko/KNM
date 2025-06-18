const ProductFeedback = require('../models/productfeedback');
const Order = require('../models/order'); 
const mongoose = require('mongoose');

exports.createProductFeedback = async (req, res, next) => {
    try {
        const { rating, feedback, productId, orderId, userId } = req.body;
        if (!rating || !productId || !orderId || !userId) {
            console.log("Missing required fields");
            return res.status(400).json({
                success: false,
                message: 'Rating, product ID, order ID, and user ID are required.'
            });
        }

        const order = await Order.findOne({
            _id: orderId,
            user: userId, 
            'orderProducts.product': productId, 
        });

        if (!order) {
            console.log("Order not found or product not in order items");
            return res.status(400).json({
                success: false,
                message: 'You must have purchased this product to leave feedback.'
            });
        }

        const newProductFeedback = await ProductFeedback.create({
            userId,
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
        console.log("Error submitting feedback:", error);
        next(error);
    }
};

exports.getProductFeedbacks = async (req, res, next) => {
  try {
    const { productId } = req.params; 
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required.'
      });
    }
    const feedbacks = await ProductFeedback.find({ productId });
    res.status(200).json({
      success: true,
      feedbacks
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductFeedbacksMobile = async (req, res, next) => {
    console.log('getProductFeedbacksMobile');
    try {
        const { productId } = req.params; 
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required.'
            });
        }
        const feedbacks = await ProductFeedback.find({ productId })
            .populate('userId', 'fname middlei lname avatar ') 
            .populate('productId', 'name description price'); 

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
      const feedbacks = await ProductFeedback.find()
        .populate('userId', 'firstName lastName email')
        .populate('productId', 'name description price') 
  
      if (!feedbacks || feedbacks.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No feedbacks found for any products.',
        });
      }
  
      res.status(200).json({
        success: true,
        feedbacks,
      });
    } catch (error) {
      next(error);
    }
  };

exports.getAverageProductRating = async (req, res, next) => {
    try {
        const { productId } = req.params; 

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required.'
            });
        }

        const objectIdProductId = new mongoose.Types.ObjectId(productId);

        const result = await ProductFeedback.aggregate([
            { $match: { productId: objectIdProductId } }, 
            { $group: { _id: null, averageRating: { $avg: "$rating" } } }
        ]);

        if (!result.length) {
            return res.status(404).json({
                success: false,
                message: 'No feedbacks found for this product.'
            });
        }

        res.status(200).json({
            success: true,
            averageRating: result[0].averageRating.toFixed(2) 
        });
    } catch (error) {
        next(error);
    }
};


