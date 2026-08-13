const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const notificationController = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/auth');

// Routes
router.get('/', authMiddleware, notificationController.getNotifications);
router.get('/unread', authMiddleware, notificationController.getUnreadNotifications);
router.post('/test', authMiddleware, notificationController.createTestNotification);
router.patch('/:id/read', authMiddleware, notificationController.markAsRead);
router.patch('/read-all', authMiddleware, notificationController.markAllAsRead);
router.delete('/:id', authMiddleware, notificationController.deleteNotification);
router.delete('/', authMiddleware, notificationController.deleteAllNotifications);

module.exports = router;