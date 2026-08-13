// frontend/src/services/chatService.js

import api from './api';

export const chatService = {
  // ============================================
  // Session Management
  // ============================================
  
  // ດຶງລາຍຊື່ Sessions ທັງໝົດ
  async getSessions() {
    try {
      console.log('📝 Calling API: GET /chat/sessions');
      const response = await api.get('/chat/sessions');
      console.log('📝 API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get sessions error:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to get sessions',
      };
    }
  },

  // ສ້າງ Session ໃໝ່
  async createSession(title = 'New Chat') {
    try {
      console.log('📝 Calling API: POST /chat/session');
      const response = await api.post('/chat/session', { title });
      console.log('📝 API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Create session error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create session',
      };
    }
  },

  // ອັບເດດຊື່ Session
  async updateSession(sessionId, title) {
    try {
      const response = await api.put(`/chat/session/${sessionId}`, { title });
      return response.data;
    } catch (error) {
      console.error('Update session error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update session',
      };
    }
  },

  // ລຶບ Session
  async deleteSession(sessionId) {
    try {
      const response = await api.delete(`/chat/session/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Delete session error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete session',
      };
    }
  },

  // ============================================
  // Message Management
  // ============================================

  // ສົ່ງຂໍ້ຄວາມ
  async sendMessage(message, sessionId = null, subjectId = null, fileId = null) {
    try {
      const payload = {
        message: message.trim(),
        session_id: sessionId || 'default',
        subject_id: subjectId || null,
      };

      if (fileId) {
        payload.file_id = fileId;
      }

      const response = await api.post('/chat/send', payload);
      return response.data;
    } catch (error) {
      console.error('Chat API Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ດຶງປະຫວັດການສົນທະນາ
  async getHistory(sessionId = null) {
    try {
      const params = sessionId ? { session_id: sessionId } : {};
      const response = await api.get('/chat/history', { params });
      return response.data;
    } catch (error) {
      console.error('Get history error:', error);
      return {
        success: false,
        data: [],
      };
    }
  },

  // ລຶບປະຫວັດການສົນທະນາ
  async clearHistory(sessionId = null) {
    try {
      const response = await api.delete('/chat/clear', {
        data: { session_id: sessionId },
      });
      return response.data;
    } catch (error) {
      console.error('Clear history error:', error);
      return {
        success: false,
      };
    }
  },
};