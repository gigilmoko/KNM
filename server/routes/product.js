const express = require('express');
const router = express.Router();
const { 
    getProduct, 
    newProduct, 
    getSingleProduct, 
    deleteProduct, 
    updateProduct, 
    deleteImage,
    getProductDetails
} = require('../controller/productController');

router.get('/product/all', getProduct);
router.post('/product/new', newProduct);
router.get('/product/:id', getSingleProduct);
router.delete('/product/delete/:id', deleteProduct);
router.put('/product/update/:id', updateProduct);
router.delete('/product/delete-image/:public_id', deleteImage);
router.get('/product/details/:id', getProductDetails);

module.exports = router;