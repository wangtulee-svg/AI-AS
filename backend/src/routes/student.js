// backend/src/routes/student.js

const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/stats', studentController.getStats);
router.get('/activities', studentController.getRecentActivities);
router.get('/progress', studentController.getSubjectProgress);
router.get('/upcoming-classes', studentController.getUpcomingClasses);

module.exports = router;