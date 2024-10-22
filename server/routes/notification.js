const express = require('express');
const { getNotifications, markNotificationAsRead, getUnreadNotificationsCount} = require('../controller/notificationController');
const { isAuthenticatedUser } = require('../middlewares/auth');

const router = express.Router();

// Route to get notifications for the logged-in user
router.get('/notifications', isAuthenticatedUser, getNotifications);
router.put('/notifications/:id/markAsRead', isAuthenticatedUser, markNotificationAsRead);
router.get('/notifications/unread-count', isAuthenticatedUser, getUnreadNotificationsCount);
module.exports = router;
