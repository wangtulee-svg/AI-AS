const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ragController = require('../controllers/ragController');
const { authMiddleware } = require('../middleware/auth');

// Validation
const indexValidation = [
  body('fileId').notEmpty().withMessage('File ID is required')
];

const askValidation = [
  body('question').notEmpty().withMessage('Question is required'),
  body('documentIds').optional().isArray(),
  body('language').optional().isIn(['lao', 'english', 'both'])
];

const searchValidation = [
  body('query').notEmpty().withMessage('Search query is required'),
  body('documentIds').optional().isArray(),
  body('topK').optional().isInt({ min: 1, max: 20 })
];

// Routes
router.post('/index', authMiddleware, indexValidation, ragController.indexPDF);
router.post('/ask', authMiddleware, askValidation, ragController.askWithRAG);
router.post('/search', authMiddleware, searchValidation, ragController.searchDocuments);
router.get('/documents', authMiddleware, ragController.getIndexedDocuments);
router.delete('/documents/:documentId', authMiddleware, ragController.removeIndexedDocument);

module.exports = router;