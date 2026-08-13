// backend/src/routes/studyPlanner.js

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const studyPlannerController = require('../controllers/studyPlannerController');
const { authMiddleware } = require('../middleware/auth');

// ທຸກ Route ຕ້ອງມີ Authentication
router.use(authMiddleware);

// Validation
const createPlanValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('start_date').isISO8601().withMessage('Valid start date is required'),
  body('end_date').isISO8601().withMessage('Valid end date is required'),
  body('subject_id').optional().isString(),
];

const createTaskValidation = [
  body('title').notEmpty().withMessage('Task title is required'),
  body('task_date').isISO8601().withMessage('Valid task date is required'),
];

// ✅ Route ສຳລັບ AI Study Planner
router.post('/ai/generate', [
  body('subjects').isArray({ min: 1 }).withMessage('At least one subject is required'),
  body('examDate').isISO8601().withMessage('Valid exam date is required'),
  body('availableHours').optional().isNumeric().withMessage('Available hours must be a number'),
], studyPlannerController.generateAIStudyPlan);

// Study Plan Routes
router.get('/', studyPlannerController.getPlans);
router.get('/stats', studyPlannerController.getStudyStats);
router.post('/', createPlanValidation, studyPlannerController.createPlan);
router.get('/:id', studyPlannerController.getPlanById);
router.put('/:id', studyPlannerController.updatePlan);
router.delete('/:id', studyPlannerController.deletePlan);

// Task Routes
router.post('/:id/tasks', createTaskValidation, studyPlannerController.createTask);
router.put('/tasks/:taskId', studyPlannerController.updateTask);
router.delete('/tasks/:taskId', studyPlannerController.deleteTask);
router.patch('/tasks/:taskId/toggle', studyPlannerController.toggleTaskCompletion);

// AI Recommendation (ມີຢູ່ແລ້ວ)
router.post('/ai/recommend', studyPlannerController.generateAIRecommendation);

module.exports = router;