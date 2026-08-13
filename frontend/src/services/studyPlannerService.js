import api from './api';

export const studyPlannerService = {
  // Study Plan CRUD
  async createPlan(data) {
    const response = await api.post('/study-planner', data);
    return response.data;
  },

  async getPlans(activeOnly = false) {
    const params = activeOnly ? { active_only: 'true' } : {};
    const response = await api.get('/study-planner', { params });
    return response.data;
  },

  async getPlanById(id) {
    const response = await api.get(`/study-planner/${id}`);
    return response.data;
  },

  async updatePlan(id, data) {
    const response = await api.put(`/study-planner/${id}`, data);
    return response.data;
  },

  async deletePlan(id) {
    const response = await api.delete(`/study-planner/${id}`);
    return response.data;
  },

  // Tasks
  async createTask(planId, data) {
    const response = await api.post(`/study-planner/${planId}/tasks`, data);
    return response.data;
  },

  async updateTask(taskId, data) {
    const response = await api.put(`/study-planner/tasks/${taskId}`, data);
    return response.data;
  },

  async deleteTask(taskId) {
    const response = await api.delete(`/study-planner/tasks/${taskId}`);
    return response.data;
  },

  async toggleTask(taskId) {
    const response = await api.patch(`/study-planner/tasks/${taskId}/toggle`);
    return response.data;
  },

  // Stats & AI
  async getStats() {
    const response = await api.get('/study-planner/stats');
    return response.data;
  },

  async getAIRecommendation(subjects) {
    const response = await api.post('/study-planner/ai/recommend', { subjects });
    return response.data;
  },
};