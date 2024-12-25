const express = require('express');
const router = express.Router();
const { 
    getProduct, 
    newProduct, 
    getSingleProduct, 
    deleteProduct, 
    updateProduct, 
    deleteImage,
    getProductDetails,
    getProductsByCategory,   
    searchProduct
} = require('../controller/productController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.get('/product/all', getProduct);
router.get('/product/search', searchProduct);
router.post('/product/new', isAuthenticatedUser, newProduct);
router.get('/product/:id', getSingleProduct);
router.delete('/product/delete/:id', isAuthenticatedUser, deleteProduct);
router.put('/product/update/:id', isAuthenticatedUser, updateProduct);
router.delete('/product/delete-image/:public_id', isAuthenticatedUser, deleteImage);
router.get('/product/details/:id', getProductDetails);
router.get('/product/category/:id', getProductsByCategory);


module.exports = router;