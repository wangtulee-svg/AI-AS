// backend/src/routes/quizzes.js

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const quizController = require('../controllers/quizController');
const { authMiddleware } = require('../middleware/auth');

// ທຸກ Route ຕ້ອງມີ Authentication
router.use(authMiddleware);

// ✅ Route ສຳລັບສ້າງ Quiz ດ້ວຍ AI
router.post('/generate', [
  body('topic').notEmpty().withMessage('Topic is required'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
  body('numQuestions').optional().isInt({ min: 1, max: 20 }),
  body('pdfId').optional().isString(),
  body('subjectId').optional().isString(),
], quizController.generateQuiz);

// ✅ Routes ທີ່ບໍ່ມີ ID
router.get('/', quizController.getQuizzes);
router.get('/history', quizController.getQuizHistory);
router.get('/stats', quizController.getQuizStats);

// ✅ Routes ທີ່ມີ ID (ຕ້ອງຢູ່ທ້າຍສຸດ)
router.get('/:id', quizController.getQuizById);
router.post('/:id/submit', quizController.submitQuiz);  // ✅ ຕ້ອງມີນີ້

module.exports = router;