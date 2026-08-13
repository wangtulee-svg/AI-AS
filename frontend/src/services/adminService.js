// services/adminService.js

import api from './api';

export const adminService = {
  // ສະຖິຕິທົ່ວໄປ
  async getStats() {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // ດຶງລາຍຊື່ຜູ້ໃຊ້
  async getUsers(page = 1, limit = 10, search = '') {
    const response = await api.get('/admin/users', {
      params: { page, limit, search },
    });
    return response.data;
  },

  // ✅ ສ້າງຜູ້ໃຊ້ໃໝ່
  async createUser(userData) {
    try {
      const response = await api.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      console.error('Create user error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create user',
        errors: error.response?.data?.errors || []
      };
    }
  },

  // ອັບເດດບົດບາດຜູ້ໃຊ້
  async updateUserRole(userId, role) {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  // ລຶບຜູ້ໃຊ້
  async deleteUser(userId) {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // ສະຖິຕິລາຍວັນ
  async getDailyStats(days = 7) {
    const response = await api.get('/admin/daily-stats', {
      params: { days },
    });
    return response.data;
  },
};