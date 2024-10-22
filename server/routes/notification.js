const express = require('express');
const {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,// Import the new delete function
  getUnreadNotificationsCount,
} = require('../controller/notificationController');
const { isAuthenticatedUser } = require('../middlewares/auth');

const router = express.Router();


router.get('/notifications', isAuthenticatedUser, getNotifications);
router.put('/notifications/:id/markAsRead', isAuthenticatedUser, markNotificationAsRead);
router.delete('/notifications/:id', isAuthenticatedUser, deleteNotification); 
router.get('/notifications/unread-count', isAuthenticatedUser, getUnreadNotificationsCount);

module.exports = router;
