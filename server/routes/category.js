const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles, isAdmin } = require('../middlewares/auth');

const { getCategory, newCategory, getSingleCategory, deleteCategory, updateCategory, getCategoryWithProducts} = require('../controller/categoryController');

router.get('/category/all', getCategory);
router.post('/category/new', isAuthenticatedUser, isAdmin, newCategory);
router.get('/category/:id', getSingleCategory);
// router.get('/category/:categoryId/products', getCategoryWithProducts);
router.delete('/category/delete/:id', isAuthenticatedUser, isAdmin, deleteCategory);
router.put('/category/update/:id', isAuthenticatedUser, isAdmin, updateCategory);

module.exports = router;