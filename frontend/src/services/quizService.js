import api from './api';

export const quizService = {
  // ດຶງລາຍຊື່ Quiz
  async getQuizzes(params = {}) {
    const response = await api.get('/quizzes', { params });
    return response.data;
  },

  // ດຶງ Quiz ສະເພາະ
  async getQuizById(id) {
    const response = await api.get(`/quizzes/${id}`);
    return response.data;
  },

  // ✅ ສ້າງ Quiz ໃໝ່ (ດ້ວຍ AI)
  async generateQuiz(data) {
    try {
      const response = await api.post('/quizzes/generate', data);
      return response.data;
    } catch (error) {
      console.error('Generate quiz error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to generate quiz',
        errors: error.response?.data?.errors || [],
      };
    }
  },

  // ສົ່ງຄຳຕອບ
  async submitQuiz(quizId, answers) {
    try {
      console.log(`📝 Submitting quiz: ${quizId}`);
      const response = await api.post(`/quizzes/${quizId}/submit`, { answers });
      return response.data;
    } catch (error) {
      console.error('Submit quiz error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit quiz',
        error: error.response?.data?.error || error.message,
        status: error.response?.status || 500,
      };
    }
  },

  // ດຶງປະຫວັດ
  async getHistory(quizId = null) {
    const params = quizId ? { quiz_id: quizId } : {};
    const response = await api.get('/quizzes/history', { params });
    return response.data;
  },

  // ດຶງສະຖິຕິ
  async getStats() {
    const response = await api.get('/quizzes/stats');
    return response.data;
  },

  // ລຶບ Quiz
  async deleteQuiz(quizId) {
    const response = await api.delete(`/quizzes/${quizId}`);
    return response.data;
  },
};