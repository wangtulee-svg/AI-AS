const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const subjectController = require('../controllers/subjectController');
const { authMiddleware } = require('../middleware/auth');

// Validation
const createValidation = [
  body('code').notEmpty().withMessage('Subject code is required'),
  body('name').notEmpty().withMessage('Subject name is required'),
  body('credits').optional().isInt({ min: 1, max: 6 }),
  body('faculty').optional().isString(),
  body('semester').optional().isInt({ min: 1, max: 8 }),
  body('year').optional().isInt({ min: 2000, max: 2100 })
];

const updateValidation = [
  body('code').optional().notEmpty(),
  body('name').optional().notEmpty(),
  body('credits').optional().isInt({ min: 1, max: 6 }),
  body('faculty').optional().isString(),
  body('semester').optional().isInt({ min: 1, max: 8 }),
  body('year').optional().isInt({ min: 2000, max: 2100 })
];

const enrollValidation = [
  body('subjectId').notEmpty().withMessage('Subject ID is required')
];

// Routes
router.post('/', authMiddleware, createValidation, subjectController.createSubject);
router.get('/', authMiddleware, subjectController.getSubjects);
router.get('/:id', authMiddleware, subjectController.getSubjectById);
router.put('/:id', authMiddleware, updateValidation, subjectController.updateSubject);
router.delete('/:id', authMiddleware, subjectController.deleteSubject);
router.post('/enroll', authMiddleware, enrollValidation, subjectController.enrollSubject);
router.post('/unenroll', authMiddleware, enrollValidation, subjectController.unenrollSubject);

module.exports = router;