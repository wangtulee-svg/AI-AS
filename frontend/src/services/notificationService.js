import api from './api';

export const notificationService = {
  // ດຶງການແຈ້ງເຕືອນ
  async getNotifications(limit = 20, offset = 0) {
    const response = await api.get('/notifications', {
      params: { limit, offset },
    });
    return response.data;
  },

  // ດຶງການແຈ້ງເຕືອນທີ່ຍັງບໍ່ອ່ານ
  async getUnread() {
    const response = await api.get('/notifications/unread');
    return response.data;
  },

  // ໝາຍວ່າອ່ານແລ້ວ
  async markAsRead(id) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  // ໝາຍວ່າອ່ານແລ້ວທັງໝົດ
  async markAllAsRead() {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  // ລຶບການແຈ້ງເຕືອນ
  async deleteNotification(id) {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  // ລຶບການແຈ້ງເຕືອນທັງໝົດ
  async deleteAll() {
    const response = await api.delete('/notifications');
    return response.data;
  },

  // ສ້າງການແຈ້ງເຕືອນທົດສອບ
  async createTest(type = 'info') {
    const response = await api.post('/notifications/test', { type });
    return response.data;
  },
};