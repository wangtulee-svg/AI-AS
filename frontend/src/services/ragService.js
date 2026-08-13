import api from './api';

export const ragService = {
  // ສ້າງ RAG Index ຈາກ PDF
  async indexPDF(fileId) {
    const response = await api.post('/rag/index', { fileId });
    return response.data;
  },

  // ຖາມ-ຕອບດ້ວຍ RAG
  async askWithRAG(question, documentIds = null, language = 'both') {
    const response = await api.post('/rag/ask', {
      question,
      documentIds,
      language
    });
    return response.data;
  },

  // ຄົ້ນຫາເອກະສານ
  async searchDocuments(query, documentIds = null, topK = 5) {
    const response = await api.post('/rag/search', {
      query,
      documentIds,
      topK
    });
    return response.data;
  },

  // ດຶງລາຍຊື່ເອກະສານທີ່ຖືກ Index
  async getIndexedDocuments() {
    const response = await api.get('/rag/documents');
    return response.data;
  },

  // ລຶບເອກະສານອອກຈາກ Index
  async removeIndexedDocument(documentId) {
    const response = await api.delete(`/rag/documents/${documentId}`);
    return response.data;
  }
};