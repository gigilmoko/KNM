const ProductFeedback = require('../models/productfeedback');
const Order = require('../models/order');  // Assuming the path is correct
const mongoose = require('mongoose');

exports.createProductFeedback = async (req, res, next) => {
    // console.log("Product feedback API touched");

    try {
        const { rating, feedback, productId, orderId, userId } = req.body;

        // console.log("Received data:", { rating, feedback, productId, orderId, userId });

        // Ensure all required fields are provided
        if (!rating || !productId || !orderId || !userId) {
            console.log("Missing required fields");
            return res.status(400).json({
                success: false,
                message: 'Rating, product ID, order ID, and user ID are required.'
            });
        }

        // Find the order to check if the user purchased the product
        const order = await Order.findOne({
            _id: orderId,
            user: userId, // Ensure the order belongs to the provided userId
            'orderProducts.product': productId, // Ensure the product is in the order's items
        });

        // If the order is not found, return an error
        if (!order) {
            console.log("Order not found or product not in order items");
            return res.status(400).json({
                success: false,
                message: 'You must have purchased this product to leave feedback.'
            });
        }

        // Create new feedback
        const newProductFeedback = await ProductFeedback.create({
            userId,
            productId,
            orderId,
            rating,
            feedback
        });

        // console.log("Product feedback submitted successfully:", newProductFeedback);

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

exports.getProductFeedbacksMobile = async (req, res, next) => {
    console.log('getProductFeedbacksMobile');
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
        const feedbacks = await ProductFeedback.find({ productId })
            .populate('userId', 'fname middlei lname avatar ') // Populate user details
            .populate('productId', 'name description price'); // Populate product details

        // If no feedbacks are found
        // if (!feedbacks || feedbacks.length === 0) {
        //     return res.status(404).json({
        //         success: false,
        //         message: 'No feedbacks found for this product.'
        //     });
        // }

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

// exports.getAllProductFeedbacksMobile = async (req, res, next) => {
//     try {
//       // Find all feedbacks from the ProductFeedback collection
//       const feedbacks = await ProductFeedback.find()
//         .populate('userId', 'fname middlei lname avatar') // Populate user details
//         .populate('productId', 'name description price'); // Populate product details
  
//       // If no feedbacks are found
//       if (!feedbacks || feedbacks.length === 0) {
//         return res.status(404).json({
//           success: false,
//           message: 'No feedbacks found for any products.',
//         });
//       }
  
//       // Return all feedbacks
//       res.status(200).json({
//         success: true,
//         feedbacks,
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

  
exports.getAverageProductRating = async (req, res, next) => {
    try {
        const { productId } = req.params; // Get the productId from request params

        // Ensure productId is provided
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required.'
            });
        }

        // Convert productId to ObjectId
        const objectIdProductId = new mongoose.Types.ObjectId(productId);

        // Aggregate to calculate the average rating
        const result = await ProductFeedback.aggregate([
            { $match: { productId: objectIdProductId } }, // Match using ObjectId
            { $group: { _id: null, averageRating: { $avg: "$rating" } } }
        ]);

        // If no feedbacks are found
        if (!result.length) {
            return res.status(404).json({
                success: false,
                message: 'No feedbacks found for this product.'
            });
        }

        // Return only the average rating in the specified format
        res.status(200).json({
            success: true,
            averageRating: result[0].averageRating.toFixed(2) // Convert to 2 decimal places
        });
    } catch (error) {
        next(error);
    }
};


