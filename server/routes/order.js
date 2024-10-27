const express = require('express');
const router = express.Router();

const { createOrder } = require('../controller/orderController');

router.get('/orders', createOrder);

module.exports = router;