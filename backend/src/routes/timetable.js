const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const timetableController = require('../controllers/timetableController');
const { authMiddleware } = require('../middleware/auth');

// Validation
const createValidation = [
  body('subject_id').notEmpty().withMessage('Subject ID is required'),
  body('day_of_week').isIn(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'])
    .withMessage('Invalid day of week'),
  body('start_time').isISO8601().withMessage('Valid start time is required'),
  body('end_time').isISO8601().withMessage('Valid end time is required'),
  body('room').optional().isString(),
  body('semester').optional().isString(),
];

// Routes
router.get('/', authMiddleware, timetableController.getSchedules);
router.get('/grouped', authMiddleware, timetableController.getGroupedSchedules);
router.get('/stats', authMiddleware, timetableController.getTimetableStats);
router.post('/', authMiddleware, createValidation, timetableController.createSchedule);
router.get('/:id', authMiddleware, timetableController.getScheduleById);
router.put('/:id', authMiddleware, timetableController.updateSchedule);
router.delete('/:id', authMiddleware, timetableController.deleteSchedule);

module.exports = router;