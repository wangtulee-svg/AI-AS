// frontend/src/services/studentService.js

import api from './api';

export const studentService = {
  // ດຶງສະຖິຕິຂອງນັກສຶກສາ
  async getStats() {
    try {
      const response = await api.get('/student/stats');
      return response.data;
    } catch (error) {
      console.error('Get student stats error:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to load stats',
      };
    }
  },

  // ດຶງກິດຈະກຳຫຼ້າສຸດ
  async getRecentActivities(limit = 5) {
    try {
      const response = await api.get('/student/activities', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Get activities error:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to load activities',
      };
    }
  },

  // ດຶງຄວາມຄືບໜ້າຂອງວິຊາ
  async getSubjectProgress() {
    try {
      const response = await api.get('/student/progress');
      return response.data;
    } catch (error) {
      console.error('Get progress error:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to load progress',
      };
    }
  },

  // ດຶງຕາຕະລາງຮຽນ
  async getUpcomingClasses(limit = 3) {
    try {
      const response = await api.get('/student/upcoming-classes', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Get upcoming classes error:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to load classes',
      };
    }
  },
};