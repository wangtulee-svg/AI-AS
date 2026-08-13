// backend/src/routes/chat.js

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const chatController = require('../controllers/chatController');
const { authMiddleware } = require('../middleware/auth');

// ທຸກ Route ຕ້ອງມີ Authentication
router.use(authMiddleware);

// ============================================
// Session Routes
// ============================================
router.post('/session', chatController.createSession);
router.get('/sessions', chatController.getSessions);
router.put('/session/:sessionId', chatController.updateSession);
router.delete('/session/:sessionId', chatController.deleteSession);

// ============================================
// Message Routes
// ============================================
const messageValidation = [
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isString()
    .withMessage('Message must be a string'),
  body('session_id')
    .optional()
    .isString()
    .withMessage('Session ID must be a string'),
  body('subject_id')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
        return true;
      }
      if (typeof value === 'string') {
        return true;
      }
      if (Array.isArray(value)) {
        return true;
      }
      throw new Error('Subject ID must be a string or null');
    }),
  body('file_id')
    .optional()
    .isString()
    .withMessage('File ID must be a string'),
];

router.post('/send', messageValidation, chatController.sendMessage);
router.get('/history', chatController.getChatHistory);
router.delete('/clear', chatController.clearHistory);

module.exports = router;