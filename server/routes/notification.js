const express = require('express');
const {
  createNotification,
  getNotifications,
  toggleNotificationReadStatus,
  deleteNotification,
  getUnreadNotificationsCount,
  deleteAllNotifications
} = require('../controller/notificationController');
const { isAuthenticatedUser } = require('../middlewares/auth');

const router = express.Router();

router.get('/notifications', isAuthenticatedUser, getNotifications);
router.post('/notifications/create', isAuthenticatedUser, createNotification);
router.put('/notifications/:id/toggleReadStatus', isAuthenticatedUser, toggleNotificationReadStatus);
router.delete('/notifications/:id', isAuthenticatedUser, deleteNotification); 
router.get('/notifications/unread-count', isAuthenticatedUser, getUnreadNotificationsCount);
router.delete('/notifications', isAuthenticatedUser, deleteAllNotifications); 

module.exports = router;
