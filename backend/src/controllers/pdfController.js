const pdfService = require('../services/pdfService');
const geminiService = require('../services/geminiService');
const prisma = require('../lib/prisma');
const { validationResult } = require('express-validator');

exports.uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const userId = req.userId;
    const fileInfo = await pdfService.saveFile(req.file);
    const extractedText = await pdfService.extractText(fileInfo.filepath);

    const pdfDocument = await prisma.pDFDocument.create({
      data: {
        title: fileInfo.filename,
        file_path: fileInfo.filepath,
        file_size: fileInfo.size,
        pages: extractedText.pages,
        uploaded_by: userId,
      },
    });

    res.json({
      success: true,
      data: {
        file: fileInfo,
        document: pdfDocument,
        pages: extractedText.pages,
        text_preview: extractedText.text.substring(0, 500) + '...',
      },
    });
  } catch (error) {
    console.error('Upload PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload PDF',
      error: error.message,
    });
  }
};

exports.summarizePDF = async (req, res) => {
  try {
    const { fileId, language = 'both' } = req.body;
    
    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: 'File ID is required',
      });
    }

    const pdfDocument = await prisma.pDFDocument.findUnique({
      where: { id: fileId },
    });

    if (!pdfDocument) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    const extractedText = await pdfService.extractText(pdfDocument.file_path);
    const summary = await geminiService.summarize(extractedText.text, language);

    const updatedDoc = await prisma.pDFDocument.update({
      where: { id: fileId },
      data: {
        summary: summary.summary,
        summary_lao: language === 'lao' || language === 'both' ? summary.summary : null,
        summary_eng: language === 'english' || language === 'both' ? summary.summary : null,
      },
    });

    res.json({
      success: true,
      data: {
        document: updatedDoc,
        summary: summary,
        pages: extractedText.pages,
      },
    });
  } catch (error) {
    console.error('Summarize PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to summarize PDF',
      error: error.message,
    });
  }
};

exports.getPDFList = async (req, res) => {
  try {
    const userId = req.userId;

    const documents = await prisma.pDFDocument.findMany({
      where: {
        uploaded_by: userId,
      },
      orderBy: {
        created_at: 'desc',
      },
      select: {
        id: true,
        title: true,
        file_size: true,
        pages: true,
        summary: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            questions: true,
            quizzes: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error('Get PDF list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get PDF list',
    });
  }
};

exports.getPDFDetail = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.userId;

    const document = await prisma.pDFDocument.findFirst({
      where: {
        id: fileId,
        uploaded_by: userId,
      },
      include: {
        questions: {
          orderBy: {
            created_at: 'desc',
          },
          take: 10,
        },
        quizzes: {
          orderBy: {
            created_at: 'desc',
          },
          take: 5,
        },
      },
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    res.json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error('Get PDF detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get PDF detail',
    });
  }
};

exports.askPDF = async (req, res) => {
  try {
    const { fileId, question, language = 'both' } = req.body;
    
    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: 'File ID is required',
      });
    }

    if (!question || question.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Question is required',
      });
    }

    const pdfDocument = await prisma.pDFDocument.findUnique({
      where: { id: fileId },
    });

    if (!pdfDocument) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    const extractedText = await pdfService.extractText(pdfDocument.file_path);
    const answer = await geminiService.askQuestion(extractedText.text, question, language);

    if (answer.success) {
      await prisma.pDFQuestion.create({
        data: {
          pdf_id: fileId,
          question: question,
          answer: answer.answer,
          language: language,
        },
      });
    }

    res.json({
      success: true,
      data: {
        document: pdfDocument,
        question: question,
        answer: answer,
      },
    });
  } catch (error) {
    console.error('Ask PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to answer question',
      error: error.message,
    });
  }
};

exports.generateQuiz = async (req, res) => {
  try {
    const { fileId, numberOfQuestions = 10, language = 'both' } = req.body;
    
    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: 'File ID is required',
      });
    }

    const pdfDocument = await prisma.pDFDocument.findUnique({
      where: { id: fileId },
    });

    if (!pdfDocument) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    const extractedText = await pdfService.extractText(pdfDocument.file_path);
    const quiz = await geminiService.generateQuiz(extractedText.text, numberOfQuestions, language);

    if (quiz.success) {
      await prisma.pDFQuiz.create({
        data: {
          pdf_id: fileId,
          questions: quiz.quiz,
          language: language,
        },
      });
    }

    res.json({
      success: true,
      data: {
        document: pdfDocument,
        quiz: quiz,
        numberOfQuestions: numberOfQuestions,
      },
    });
  } catch (error) {
    console.error('Generate Quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate quiz',
      error: error.message,
    });
  }
};

exports.deletePDF = async (req, res) => {
  try {
    const { fileId } = req.params;
    
    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: 'File ID is required',
      });
    }

    const pdfDocument = await prisma.pDFDocument.findUnique({
      where: { id: fileId },
    });

    if (!pdfDocument) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    await pdfService.deleteFile(pdfDocument.file_path);
    await prisma.pDFDocument.delete({
      where: { id: fileId },
    });

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error.message,
    });
  }
};