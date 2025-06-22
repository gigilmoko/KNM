const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, isAdmin } = require('../middlewares/auth');
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask
} = require('../controller/taskController');

router.post('/tasks', isAuthenticatedUser, isAdmin, createTask);
router.get('/tasks', isAuthenticatedUser, getTasks);
router.get('/tasks/:id', isAuthenticatedUser, getTask);
router.put('/tasks/:id', isAuthenticatedUser, isAdmin, updateTask);
router.delete('/tasks/:id', isAuthenticatedUser, isAdmin, deleteTask);

module.exports = router;