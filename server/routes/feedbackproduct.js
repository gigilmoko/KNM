const express = require('express');
const router = express.Router();

const { createProductFeedback, getProductFeedbacks, getAllProductFeedbacks } = require('../controller/feedbackproductController'); // Assuming the correct path
const { isAuthenticatedUser } = require('../middlewares/auth');

router.post('/feedback/product/new', isAuthenticatedUser, createProductFeedback); // Route for submitting feedback
router.get('/feedback/product/:productId', isAuthenticatedUser, getProductFeedbacks); // Route for fetching all feedback
router.get('/feedback/product/list', getAllProductFeedbacks); // Route for fetching all feedback

module.exports = router;
