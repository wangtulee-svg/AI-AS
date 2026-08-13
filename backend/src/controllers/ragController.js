// backend/src/controllers/ragController.js

const prisma = require('../lib/prisma');
const ragService = require('../services/ragService');
const pdfService = require('../services/pdfService');
const { validationResult } = require('express-validator');

// ສ້າງ RAG Index ຈາກ PDF
exports.indexPDF = async (req, res) => {
  try {
    const { fileId } = req.body;
    const userId = req.userId;
    
    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: 'File ID is required'
      });
    }

    // ຊອກຫາ PDF ໃນ Database
    const pdfDocument = await prisma.pDFDocument.findFirst({
      where: {
        id: fileId,
        uploaded_by: userId
      }
    });

    if (!pdfDocument) {
      return res.status(404).json({
        success: false,
        message: 'PDF document not found'
      });
    }

    // ປະມວນຜົນ PDF ດ້ວຍ RAG
    const result = await ragService.processPDF(
      pdfDocument.file_path,
      pdfDocument.id,
      pdfDocument.title
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to index PDF',
        error: result.error
      });
    }

    // ອັບເດດສະຖານະໃນ Database
    await prisma.pDFDocument.update({
      where: { id: fileId },
      data: {
        // ເພີ່ມຟີວດເພີ່ມເຕີມສຳລັບ RAG (ຖ້າຕ້ອງການ)
      }
    });

    res.json({
      success: true,
      data: {
        documentId: pdfDocument.id,
        title: pdfDocument.title,
        chunks: result.chunks,
        pages: result.pages,
        message: 'PDF indexed successfully for RAG'
      }
    });
  } catch (error) {
    console.error('Index PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to index PDF',
      error: error.message
    });
  }
};

// ຖາມ-ຕອບດ້ວຍ RAG (ແກ້ໄຂ)
exports.askWithRAG = async (req, res) => {
  try {
    const { question, documentIds = null, language = 'both' } = req.body;
    const userId = req.userId;

    if (!question || question.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Question is required'
      });
    }

    // ຖ້າບໍ່ມີ documentIds, ເອົາ PDF ທັງໝົດຂອງຜູ້ໃຊ້
    let docIds = documentIds;
    if (!docIds || docIds.length === 0) {
      const userDocs = await prisma.pDFDocument.findMany({
        where: { uploaded_by: userId },
        select: { id: true }
      });
      docIds = userDocs.map(doc => doc.id);
    }

    // ກວດສອບວ່າມີເອກະສານໃດແດ່
    if (docIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No documents found. Please upload a PDF first.'
      });
    }

    // ຖາມຄຳຖາມດ້ວຍ RAG
    const result = await ragService.askWithRAG(question, docIds, language);

    // ============================================
    // ບັນທຶກປະຫວັດການຖາມ (ແກ້ໄຂບັນຫາ Foreign Key)
    // ============================================
    if (result.success) {
      try {
        // ກວດສອບວ່າ pdf_id ມີຢູ່ກ່ອນບັນທຶກ
        const firstDocId = result.documents?.[0] || docIds[0];
        
        // ກວດສອບວ່າ PDF ມີຢູ່ໃນຖານຂໍ້ມູນ
        if (firstDocId) {
          const pdfExists = await prisma.pDFDocument.findFirst({
            where: { id: firstDocId }
          });

          if (pdfExists) {
            await prisma.pDFQuestion.create({
              data: {
                pdf_id: firstDocId,
                question: question,
                answer: result.answer || 'No answer',
                language: language || 'both'
              }
            });
          } else {
            console.warn(`⚠️ PDF ${firstDocId} not found in database, skipping history save`);
          }
        }
      } catch (dbError) {
        // ຖ້າບັນທຶກບໍ່ໄດ້, ພຽງແຕ່ log ໄວ້ ແລະ ສືບຕໍ່
        console.warn('⚠️ Failed to save question history:', dbError.message);
      }
    }

    res.json({
      success: true,
      data: {
        question: question,
        answer: result.answer || 'No answer',
        documents: result.documents || [],
        context: result.context || [],
        sources: result.sources || [],
        provider: result.provider || 'gemini'
      }
    });
  } catch (error) {
    console.error('RAG ask error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to answer question with RAG',
      error: error.message
    });
  }
};

// ດຶງລາຍຊື່ເອກະສານທີ່ຖືກ Index
exports.getIndexedDocuments = async (req, res) => {
  try {
    const documents = ragService.getIndexedDocuments();
    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Get indexed documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get indexed documents',
      error: error.message
    });
  }
};

// ລຶບເອກະສານອອກຈາກ Index
exports.removeIndexedDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const result = ragService.removeDocument(documentId);
    res.json(result);
  } catch (error) {
    console.error('Remove indexed document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove document from index',
      error: error.message
    });
  }
};

// ຄົ້ນຫາເອກະສານ (ສຳລັບການທົດສອບ)
exports.searchDocuments = async (req, res) => {
  try {
    const { query, documentIds = null, topK = 5 } = req.body;
    const userId = req.userId;

    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // ຖ້າບໍ່ມີ documentIds, ເອົາ PDF ທັງໝົດຂອງຜູ້ໃຊ້
    let docIds = documentIds;
    if (!docIds) {
      const userDocs = await prisma.pDFDocument.findMany({
        where: { uploaded_by: userId },
        select: { id: true }
      });
      docIds = userDocs.map(doc => doc.id);
    }

    const result = await ragService.search(query, docIds, topK);
    res.json(result);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search documents',
      error: error.message
    });
  }
};