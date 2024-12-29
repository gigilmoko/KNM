const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const { getCategory, newCategory, getSingleCategory, deleteCategory, updateCategory } = require('../controller/categoryController');

router.get('/category/all', getCategory);
router.post('/category/new', isAuthenticatedUser, newCategory);
router.get('/category/:id', getSingleCategory);
router.delete('/category/delete/:id', isAuthenticatedUser, deleteCategory);
router.put('/category/update/:id', isAuthenticatedUser, updateCategory);

module.exports = router;