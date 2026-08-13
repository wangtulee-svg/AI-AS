// frontend/src/services/fileService.js

import api from './api';

export const fileService = {
  // ============================================
  // ອັບໂຫຼດໄຟລ໌
  // ============================================
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Upload file error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload file',
      };
    }
  },

  // ============================================
  // ຖາມຄຳຖາມກ່ຽວກັບໄຟລ໌
  // ============================================
  async askFile(fileId, question, language = 'both') {
    try {
      const response = await api.post('/files/ask', {
        fileId,
        question,
        language,
      });
      return response.data;
    } catch (error) {
      console.error('Ask file error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to ask question',
      };
    }
  },

  // ============================================
  // ດຶງລາຍຊື່ໄຟລ໌ທັງໝົດ
  // ============================================
  async getFiles() {
    try {
      const response = await api.get('/files/list');
      return response.data;
    } catch (error) {
      console.error('Get files error:', error);
      return {
        success: false,
        data: [],
      };
    }
  },

  // ============================================
  // ລຶບໄຟລ໌
  // ============================================
  async deleteFile(fileId) {
    try {
      const response = await api.delete(`/files/${fileId}`);
      return response.data;
    } catch (error) {
      console.error('Delete file error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete file',
      };
    }
  },

  // ============================================
  // ດຶງຂໍ້ມູນໄຟລ໌ສະເພາະ
  // ============================================
  async getFile(fileId) {
    try {
      const response = await api.get(`/files/${fileId}`);
      return response.data;
    } catch (error) {
      console.error('Get file error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get file',
      };
    }
  },
};