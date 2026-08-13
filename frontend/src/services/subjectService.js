import api from './api';

export const subjectService = {
  // ສ້າງວິຊາ
  async createSubject(data) {
    const response = await api.post('/subjects', data);
    return response.data;
  },

  // ດຶງລາຍຊື່ວິຊາທັງໝົດ
  async getSubjects() {
    const response = await api.get('/subjects');
    return response.data;
  },

  // ດຶງຂໍ້ມູນວິຊາສະເພາະ
  async getSubjectById(id) {
    const response = await api.get(`/subjects/${id}`);
    return response.data;
  },

  // ອັບເດດວິຊາ
  async updateSubject(id, data) {
    const response = await api.put(`/subjects/${id}`, data);
    return response.data;
  },

  // ລຶບວິຊາ
  async deleteSubject(id) {
    const response = await api.delete(`/subjects/${id}`);
    return response.data;
  },

  // ລົງທະບຽນວິຊາ
  async enrollSubject(subjectId) {
    const response = await api.post('/subjects/enroll', { subjectId });
    return response.data;
  },

  // ຖອນທະບຽນວິຊາ
  async unenrollSubject(subjectId) {
    const response = await api.post('/subjects/unenroll', { subjectId });
    return response.data;
  }
};