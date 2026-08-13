// backend/src/routes/analytics.js

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authMiddleware } = require('../middleware/auth');

// ທຸກ Route ຕ້ອງມີ Authentication
router.use(authMiddleware);

// Routes
router.get('/stats', analyticsController.getStats);
router.get('/subjects', analyticsController.getSubjectStats);
router.get('/history', analyticsController.getQuizHistory);
router.get('/strengths-weaknesses', analyticsController.getStrengthsAndWeaknesses);
router.get('/activity', analyticsController.getDailyActivity);
router.get('/recommendations', analyticsController.getRecommendations);
router.get('/dashboard', analyticsController.getDashboardOverview);

module.exports = router;