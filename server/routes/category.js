const express = require('express');
const router = express.Router();

const { getCategory, newCategory, getSingleCategory, deleteCategory, updateCategory } = require('../controller/categoryController');

router.get('/categories', getCategory);
router.post('/category/new', newCategory);
router.get('/category/:id', getSingleCategory);
router.delete('/categories/:id', deleteCategory);
router.put('/categories/:id', updateCategory);

module.exports = router;