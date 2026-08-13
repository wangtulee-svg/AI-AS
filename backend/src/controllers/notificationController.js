const notificationService = require('../services/notificationService');
const { validationResult } = require('express-validator');

// ດຶງການແຈ້ງເຕືອນ
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 20, offset = 0 } = req.query;

    const result = await notificationService.getNotifications(
      userId,
      parseInt(limit),
      parseInt(offset)
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
      error: error.message,
    });
  }
};

// ດຶງການແຈ້ງເຕືອນທີ່ຍັງບໍ່ອ່ານ
exports.getUnreadNotifications = async (req, res) => {
  try {
    const userId = req.userId;

    const notifications = await notificationService.getUnreadNotifications(userId);

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('Get unread notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread notifications',
      error: error.message,
    });
  }
};

// ໝາຍວ່າອ່ານແລ້ວ
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const notification = await notificationService.markAsRead(id, userId);

    if (notification.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark as read',
      error: error.message,
    });
  }
};

// ໝາຍວ່າອ່ານແລ້ວທັງໝົດ
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await notificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: `Marked ${result.count} notifications as read`,
      data: { count: result.count },
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all as read',
      error: error.message,
    });
  }
};

// ລຶບການແຈ້ງເຕືອນ
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const notification = await notificationService.deleteNotification(id, userId);

    if (notification.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message,
    });
  }
};

// ລຶບການແຈ້ງເຕືອນທັງໝົດ
exports.deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await notificationService.deleteAllNotifications(userId);

    res.json({
      success: true,
      message: `Deleted ${result.count} notifications`,
      data: { count: result.count },
    });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notifications',
      error: error.message,
    });
  }
};

// ສ້າງການແຈ້ງເຕືອນແບບທົດສອບ
exports.createTestNotification = async (req, res) => {
  try {
    const userId = req.userId;
    const { type = 'info' } = req.body;

    const types = {
      info: {
        title: 'ℹ️ Information',
        message: 'This is a test information notification.',
      },
      success: {
        title: '✅ Success!',
        message: 'This is a test success notification.',
      },
      warning: {
        title: '⚠️ Warning',
        message: 'This is a test warning notification.',
      },
      error: {
        title: '❌ Error',
        message: 'This is a test error notification.',
      },
    };

    const template = types[type] || types.info;

    const notification = await notificationService.createNotification(userId, {
      title: template.title,
      message: template.message,
      type: type,
    });

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Create test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test notification',
      error: error.message,
    });
  }
};