// controllers/adminController.js

const adminService = require('../services/adminService');
const { validationResult } = require('express-validator');

// ສະຖິຕິທົ່ວໄປ
exports.getStats = async (req, res) => {
  try {
    const stats = await adminService.getStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get stats',
      error: error.message,
    });
  }
};

// ດຶງລາຍຊື່ຜູ້ໃຊ້
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const result = await adminService.getUsers(
      parseInt(page),
      parseInt(limit),
      search
    );
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message,
    });
  }
};

// ✅ ຟັງຊັນສ້າງຜູ້ໃຊ້ໃໝ່
exports.createUser = async (req, res) => {
  try {
    console.log('📝 Creating user with data:', req.body);

    // ກວດສອບ validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array(),
        message: 'Validation failed'
      });
    }

    const { full_name, email, password, role, student_id } = req.body;

    // ກວດສອບຂໍ້ມູນພື້ນຖານ
    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full_name, email and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // ກວດສອບວ່າ email ຖືກຕ້ອງ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // ກວດສອບວ່າ role ຖືກຕ້ອງ
    const validRoles = ['student', 'lecturer', 'admin'];
    const finalRole = role || 'student';
    if (!validRoles.includes(finalRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be student, lecturer, or admin'
      });
    }

    // ສ້າງຜູ້ໃຊ້ໃໝ່
    console.log('👤 Creating user...');
    const user = await adminService.createUser({
      full_name,
      email,
      password,
      role: finalRole,
      student_id: student_id || null
    });

    console.log('✅ User created successfully:', user.id);

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('❌ Create user error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // ຈັດການຂໍ້ຜິດພາດທີ່ອາດເກີດຂຶ້ນ
    if (error.message === 'User with this email already exists') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'Student ID already exists') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // ຈັດການຂໍ້ຜິດພາດຈາກ Prisma
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (target && target.includes('email')) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
      if (target && target.includes('student_id')) {
        return res.status(400).json({
          success: false,
          message: 'Student ID already exists'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ອັບເດດບົດບາດຜູ້ໃຊ້
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['student', 'lecturer', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role',
      });
    }

    const user = await adminService.updateUserRole(userId, role);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message,
    });
  }
};

// ລຶບຜູ້ໃຊ້
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // ປ້ອງກັນການລຶບຕົວເອງ
    if (userId === req.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account',
      });
    }

    await adminService.deleteUser(userId);
    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
};

// ສະຖິຕິລາຍວັນ
exports.getDailyStats = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const stats = await adminService.getDailyStats(parseInt(days));
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get daily stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get daily stats',
      error: error.message,
    });
  }
};