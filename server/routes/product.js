const express = require('express');
const router = express.Router();

const { getProduct, newProduct, getSingleProduct, deleteProduct, updateProduct } = require('../controller/productController');

router.get('/product', getProduct);
router.post('/product/new', newProduct);
router.get('/product/:id', getSingleProduct);
router.delete('/product/delete/:id', deleteProduct);
router.put('/product/update/:id', updateProduct);

module.exports = router;