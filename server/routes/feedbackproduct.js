const express = require('express');
const router = express.Router();

const { createProductFeedback, getProductFeedbacks, getAllProductFeedbacks, getAllProductFeedbacksMobile, 
    getAverageProductRating, getProductFeedbacksMobile } = require('../controller/feedbackproductController'); // Assuming the correct path
const { isAuthenticatedUser } = require('../middlewares/auth');

router.post('/feedback/product/new', isAuthenticatedUser, createProductFeedback); // Route for submitting feedback
router.get('/feedback/product/:productId', getProductFeedbacks);
router.get('/feedback/product/:productId/mobile', getProductFeedbacksMobile); // Route for fetching all feedback
// router.get('/feedback/product/list', getAllProductFeedbacks); 
router.get('/feedback/average/product/:productId', getAverageProductRating)
router.get('/feedback/product-list', getAllProductFeedbacks); 
// router.get('/feedback/product-list/mobile', getAllProductFeedbacksMobile); 

module.exports = router;
