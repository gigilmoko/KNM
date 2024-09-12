const express = require('express');
const router = express.Router();

const { getCategory, newCategory, getSingleCategory, deleteCategory, updateCategory } = require('../controller/categoryController');

router.get('/category', getCategory);
router.post('/category/new', newCategory);
router.get('/category/:id', getSingleCategory);
router.delete('/category/delete/:id', deleteCategory);
router.put('/category/update/:id', updateCategory);

module.exports = router;