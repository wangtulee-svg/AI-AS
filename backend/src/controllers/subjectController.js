const prisma = require('../lib/prisma');
const { validationResult } = require('express-validator');

// ສ້າງວິຊາໃໝ່
exports.createSubject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { code, name, description, credits, faculty, semester, year } = req.body;
    const userId = req.userId;

    // ກວດສອບວ່າມີ code ນີ້ແລ້ວບໍ່
    const existingSubject = await prisma.subject.findUnique({
      where: { code }
    });

    if (existingSubject) {
      return res.status(409).json({
        success: false,
        message: 'Subject code already exists'
      });
    }

    const subject = await prisma.subject.create({
      data: {
        code,
        name,
        description,
        credits: credits || 3,
        faculty: faculty || null,
        semester: semester || null,
        year: year || null,
        lecturer_id: userId
      }
    });

    res.status(201).json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subject',
      error: error.message
    });
  }
};

// ດຶງລາຍຊື່ວິຊາທັງໝົດ
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        lecturer: {
          select: {
            id: true,
            full_name: true,
            email: true
          }
        },
        _count: {
          select: {
            enrollments: true,
            documents: true,
            quizzes: true
          }
        }
      },
      orderBy: {
        code: 'asc'
      }
    });

    res.json({
      success: true,
      data: subjects
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subjects',
      error: error.message
    });
  }
};

// ດຶງຂໍ້ມູນວິຊາສະເພາະ
exports.getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        lecturer: {
          select: {
            id: true,
            full_name: true,
            email: true
          }
        },
        documents: {
          select: {
            id: true,
            title: true,
            file_path: true,
            created_at: true
          }
        },
        quizzes: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            is_published: true
          }
        },
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                full_name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            enrollments: true,
            documents: true,
            quizzes: true
          }
        }
      }
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subject',
      error: error.message
    });
  }
};

// ອັບເດດວິຊາ
exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description, credits, faculty, semester, year } = req.body;

    // ກວດສອບວ່າມີວິຊານີ້ແລ້ວບໍ່
    const existingSubject = await prisma.subject.findUnique({
      where: { id }
    });

    if (!existingSubject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    const updatedSubject = await prisma.subject.update({
      where: { id },
      data: {
        code,
        name,
        description,
        credits,
        faculty,
        semester,
        year
      }
    });

    res.json({
      success: true,
      data: updatedSubject
    });
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subject',
      error: error.message
    });
  }
};

// ລຶບວິຊາ
exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const existingSubject = await prisma.subject.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            documents: true,
            quizzes: true,
            enrollments: true
          }
        }
      }
    });

    if (!existingSubject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // ຖ້າມີຂໍ້ມູນທີ່ກ່ຽວຂ້ອງ, ບໍ່ຄວນລຶບ
    if (existingSubject._count.documents > 0 || 
        existingSubject._count.quizzes > 0 || 
        existingSubject._count.enrollments > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete subject with associated data'
      });
    }

    await prisma.subject.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subject',
      error: error.message
    });
  }
};

// ລົງທະບຽນວິຊາ
exports.enrollSubject = async (req, res) => {
  try {
    const { subjectId } = req.body;
    const userId = req.userId;

    // ກວດສອບວ່າມີວິຊາ
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId }
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // ກວດສອບວ່າລົງທະບຽນແລ້ວບໍ່
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        user_id_subject_id_semester: {
          user_id: userId,
          subject_id: subjectId,
          semester: '2024-S1' // ສາມາດປັບຕາມລະບົບ
        }
      }
    });

    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        message: 'Already enrolled in this subject'
      });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        user_id: userId,
        subject_id: subjectId,
        semester: '2024-S1',
        status: 'enrolled'
      }
    });

    res.status(201).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    console.error('Enroll subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll subject',
      error: error.message
    });
  }
};

// ຖອນທະບຽນວິຊາ
exports.unenrollSubject = async (req, res) => {
  try {
    const { subjectId } = req.body;
    const userId = req.userId;

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        user_id_subject_id_semester: {
          user_id: userId,
          subject_id: subjectId,
          semester: '2024-S1'
        }
      }
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    await prisma.enrollment.delete({
      where: { id: enrollment.id }
    });

    res.json({
      success: true,
      message: 'Unenrolled successfully'
    });
  } catch (error) {
    console.error('Unenroll subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unenroll subject',
      error: error.message
    });
  }
};