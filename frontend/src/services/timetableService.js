import api from './api';

export const timetableService = {
  // ສ້າງຕາຕະລາງ
  async createSchedule(data) {
    const response = await api.post('/timetable', data);
    return response.data;
  },

  // ດຶງຕາຕະລາງທັງໝົດ
  async getSchedules(semester = null) {
    const params = semester ? { semester } : {};
    const response = await api.get('/timetable', { params });
    return response.data;
  },

  // ດຶງຕາຕະລາງແບບຈັດກຸ່ມ
  async getGroupedSchedules(semester = null) {
    const params = semester ? { semester } : {};
    const response = await api.get('/timetable/grouped', { params });
    return response.data;
  },

  // ດຶງຕາຕະລາງສະເພາະ
  async getScheduleById(id) {
    const response = await api.get(`/timetable/${id}`);
    return response.data;
  },

  // ອັບເດດຕາຕະລາງ
  async updateSchedule(id, data) {
    const response = await api.put(`/timetable/${id}`, data);
    return response.data;
  },

  // ລຶບຕາຕະລາງ
  async deleteSchedule(id) {
    const response = await api.delete(`/timetable/${id}`);
    return response.data;
  },

  // ສະຖິຕິ
  async getStats() {
    const response = await api.get('/timetable/stats');
    return response.data;
  },
};