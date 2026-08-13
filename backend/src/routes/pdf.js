const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { body } = require('express-validator');
const pdfController = require('../controllers/pdfController');
const { authMiddleware } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: fileFilter,
});

const summarizeValidation = [
  body('fileId').notEmpty().withMessage('File ID is required'),
  body('language').optional().isIn(['lao', 'english', 'both']),
];

const askValidation = [
  body('fileId').notEmpty().withMessage('File ID is required'),
  body('question').notEmpty().withMessage('Question is required'),
  body('language').optional().isIn(['lao', 'english', 'both']),
];

const quizValidation = [
  body('fileId').notEmpty().withMessage('File ID is required'),
  body('numberOfQuestions').optional().isInt({ min: 1, max: 20 }),
  body('language').optional().isIn(['lao', 'english', 'both']),
];

router.post('/upload', authMiddleware, upload.single('pdf'), pdfController.uploadPDF);
router.post('/summarize', authMiddleware, summarizeValidation, pdfController.summarizePDF);
router.post('/ask', authMiddleware, askValidation, pdfController.askPDF);
router.post('/quiz', authMiddleware, quizValidation, pdfController.generateQuiz);
router.get('/list', authMiddleware, pdfController.getPDFList);
router.get('/:fileId', authMiddleware, pdfController.getPDFDetail);
router.delete('/:fileId', authMiddleware, pdfController.deletePDF);

module.exports = router;