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
    searchProduct,
    getProductUser,
    getProductMobile,
} = require('../controller/productController');
const { isAuthenticatedUser, authorizeRoles, isAdmin } = require('../middlewares/auth');

router.get('/product/all', getProduct);
router.get('/product/all/mobile', getProductMobile);
router.get('/product/all/user', getProductUser);
router.get('/product/search', searchProduct);
router.post('/product/new', isAuthenticatedUser, isAdmin, newProduct);
router.get('/product/:id', getSingleProduct);
router.delete('/product/delete/:id', isAuthenticatedUser, isAdmin, deleteProduct);
router.put('/product/update/:id', isAuthenticatedUser, isAdmin, updateProduct);
router.delete('/product/delete-image/:public_id', isAuthenticatedUser, isAdmin, deleteImage);
router.get('/product/details/:id', getProductDetails);
router.get('/product/category/:id', getProductsByCategory);


module.exports = router;