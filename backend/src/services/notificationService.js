const prisma = require('../lib/prisma');

class NotificationService {
  // ສ້າງການແຈ້ງເຕືອນ
  async createNotification(userId, data) {
    try {
      const notification = await prisma.notification.create({
        data: {
          user_id: userId,
          title: data.title,
          message: data.message,
          type: data.type || 'info',
          link: data.link || null,
        },
      });
      return notification;
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  }

  // ສ້າງການແຈ້ງເຕືອນຫຼາຍອັນ (ສົ່ງໃຫ້ຫຼາຍຄົນ)
  async createBulkNotifications(userIds, data) {
    try {
      const notifications = await prisma.notification.createMany({
        data: userIds.map(userId => ({
          user_id: userId,
          title: data.title,
          message: data.message,
          type: data.type || 'info',
          link: data.link || null,
        })),
      });
      return notifications;
    } catch (error) {
      console.error('Create bulk notifications error:', error);
      throw error;
    }
  }

  // ດຶງການແຈ້ງເຕືອນທັງໝົດຂອງຜູ້ໃຊ້
  async getNotifications(userId, limit = 20, offset = 0) {
    try {
      const notifications = await prisma.notification.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      });

      const total = await prisma.notification.count({
        where: { user_id: userId },
      });

      const unread = await prisma.notification.count({
        where: {
          user_id: userId,
          is_read: false,
        },
      });

      return {
        notifications,
        total,
        unread,
        hasMore: offset + limit < total,
      };
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  }

  // ດຶງການແຈ້ງເຕືອນທີ່ຍັງບໍ່ອ່ານ
  async getUnreadNotifications(userId) {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          user_id: userId,
          is_read: false,
        },
        orderBy: { created_at: 'desc' },
      });
      return notifications;
    } catch (error) {
      console.error('Get unread notifications error:', error);
      throw error;
    }
  }

  // ໝາຍວ່າອ່ານແລ້ວ
  async markAsRead(notificationId, userId) {
    try {
      const notification = await prisma.notification.updateMany({
        where: {
          id: notificationId,
          user_id: userId,
        },
        data: { is_read: true },
      });
      return notification;
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  }

  // ໝາຍວ່າອ່ານແລ້ວທັງໝົດ
  async markAllAsRead(userId) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          user_id: userId,
          is_read: false,
        },
        data: { is_read: true },
      });
      return result;
    } catch (error) {
      console.error('Mark all as read error:', error);
      throw error;
    }
  }

  // ລຶບການແຈ້ງເຕືອນ
  async deleteNotification(notificationId, userId) {
    try {
      const notification = await prisma.notification.deleteMany({
        where: {
          id: notificationId,
          user_id: userId,
        },
      });
      return notification;
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    }
  }

  // ລຶບການແຈ້ງເຕືອນທັງໝົດ
  async deleteAllNotifications(userId) {
    try {
      const result = await prisma.notification.deleteMany({
        where: { user_id: userId },
      });
      return result;
    } catch (error) {
      console.error('Delete all notifications error:', error);
      throw error;
    }
  }

  // ສ້າງການແຈ້ງເຕືອນອັດຕະໂນມັດ
  async createSystemNotification(userId, type, data) {
    const templates = {
      'quiz_created': {
        title: '📝 New Quiz Available',
        message: `A new quiz "${data.quizTitle}" has been created for "${data.subjectName}".`,
        type: 'success',
      },
      'quiz_completed': {
        title: '🎯 Quiz Completed!',
        message: `You completed "${data.quizTitle}" with ${data.score}% score.`,
        type: 'success',
      },
      'document_uploaded': {
        title: '📄 Document Uploaded',
        message: `"${data.documentTitle}" has been uploaded successfully.`,
        type: 'info',
      },
      'document_summarized': {
        title: '✨ Document Summarized',
        message: `Summary for "${data.documentTitle}" is ready.`,
        type: 'info',
      },
      'study_plan_created': {
        title: '📚 Study Plan Created',
        message: `"${data.planTitle}" study plan has been created.`,
        type: 'success',
      },
      'class_added': {
        title: '🗓️ Class Added',
        message: `"${data.subjectName}" has been added to your timetable.`,
        type: 'info',
      },
      'class_reminder': {
        title: '⏰ Class Reminder',
        message: `You have "${data.subjectName}" class in ${data.timeRemaining}.`,
        type: 'warning',
      },
    };

    const template = templates[type];
    if (!template) return null;

    return await this.createNotification(userId, {
      title: template.title,
      message: template.message,
      type: template.type,
      link: data.link || null,
    });
  }
}

module.exports = new NotificationService();