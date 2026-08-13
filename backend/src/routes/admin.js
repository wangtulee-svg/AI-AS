// routes/admin.js

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// ທຸກ Route ຕ້ອງເປັນ Admin ເທົ່ານັ້ນ
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

// Routes
router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.get('/daily-stats', adminController.getDailyStats);

// ✅ ເພີ່ມ Route ສຳລັບສ້າງຜູ້ໃຊ້ໃໝ່
router.post('/users', [
  body('full_name')
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'lecturer', 'student']).withMessage('Invalid role'),
  body('student_id')
    .optional()
    .isString().withMessage('Student ID must be a string'),
], adminController.createUser);

router.put('/users/:userId/role', adminController.updateUserRole);
router.delete('/users/:userId', adminController.deleteUser);

module.exports = router;