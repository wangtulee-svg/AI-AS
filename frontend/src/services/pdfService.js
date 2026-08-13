import api from './api';

export const pdfService = {
  // ອັບໂຫຼດ PDF
  async uploadPDF(file) {
    const formData = new FormData();
    formData.append('pdf', file);
    
    const response = await api.post('/pdf/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // ສະຫຼຸບ PDF
  async summarizePDF(fileId, language = 'both') {
    const response = await api.post('/pdf/summarize', {
      fileId,
      language,
    });
    return response.data;
  },

  // ຖາມ-ຕອບກ່ຽວກັບ PDF
  async askPDF(fileId, question, language = 'both') {
    const response = await api.post('/pdf/ask', {
      fileId,
      question,
      language,
    });
    return response.data;
  },

  // ສ້າງຂໍ້ສອບເສັງ
  async generateQuiz(fileId, numberOfQuestions = 10, language = 'both') {
    const response = await api.post('/pdf/quiz', {
      fileId,
      numberOfQuestions,
      language,
    });
    return response.data;
  },

  // ລຶບ PDF
  async deletePDF(fileId) {
    const response = await api.delete(`/pdf/${fileId}`);
    return response.data;
  },

  // ດຶງລາຍຊື່ PDF ທັງໝົດ
  async getList() {
    const response = await api.get('/pdf/list');
    return response.data;
  },

  // ດຶງຂໍ້ມູນ PDF ສະເພາະ
  async getDetail(fileId) {
    const response = await api.get(`/pdf/${fileId}`);
    return response.data;
  },
};