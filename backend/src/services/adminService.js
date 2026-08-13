// services/adminService.js

const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');

class AdminService {
  // ສະຖິຕິທົ່ວໄປ
  async getStats() {
    try {
      const [
        totalUsers,
        totalSubjects,
        totalDocuments,
        totalChats,
        totalQuizzes,
        totalPDFs,
        newUsers,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.subject.count(),
        prisma.document.count(),
        prisma.chatMessage.count(),
        prisma.quiz.count(),
        prisma.pDFDocument.count(),
        prisma.user.count({
          where: {
            created_at: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

      // ວິຊາທີ່ມີນັກສຶກສາຫຼາຍທີ່ສຸດ
      const topSubjects = await prisma.subject.findMany({
        take: 5,
        orderBy: {
          enrollments: {
            _count: 'desc',
          },
        },
        select: {
          id: true,
          code: true,
          name: true,
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
      });

      // ສະຖິຕິການໃຊ້ງານ AI
      const aiUsage = {
        totalChats: totalChats,
        totalQuizzes: totalQuizzes,
        totalPDFs: totalPDFs,
        avgMessagesPerUser: totalUsers > 0 ? Math.round(totalChats / totalUsers) : 0,
      };

      // ສະຖິຕິການລົງທະບຽນຕາມບົດບາດ
      const roleDistribution = await prisma.user.groupBy({
        by: ['role'],
        _count: true,
      });

      // ຈຳນວນການເຂົ້າໃຊ້ງານທັງໝົດ
      const totalLogins = await prisma.systemLog.count({
        where: { action: 'login' },
      });

      return {
        users: {
          total: totalUsers,
          new: newUsers,
          active: Math.round(totalUsers * 0.8), // ສົມມຸດ 80% ເປັນຜູ້ໃຊ້ທີ່ເຄື່ອນໄຫວ
          roles: roleDistribution,
        },
        subjects: {
          total: totalSubjects,
          top: topSubjects,
        },
        documents: {
          total: totalDocuments,
          pdfs: totalPDFs,
        },
        ai: aiUsage,
        quizzes: {
          total: totalQuizzes,
        },
        system: {
          totalLogins,
        },
      };
    } catch (error) {
      console.error('Get stats error:', error);
      throw error;
    }
  }

  // ດຶງສະຖິຕິລາຍວັນ
  async getDailyStats(days = 7) {
    try {
      const dates = [];
      const chatCounts = [];
      const userCounts = [];
      const loginCounts = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const [chats, users, logins] = await Promise.all([
          prisma.chatMessage.count({
            where: {
              created_at: {
                gte: date,
                lt: nextDate,
              },
            },
          }),
          prisma.user.count({
            where: {
              created_at: {
                gte: date,
                lt: nextDate,
              },
            },
          }),
          prisma.systemLog.count({
            where: {
              action: 'login',
              created_at: {
                gte: date,
                lt: nextDate,
              },
            },
          }),
        ]);

        dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        chatCounts.push(chats);
        userCounts.push(users);
        loginCounts.push(logins);
      }

      return {
        dates,
        chatCounts,
        userCounts,
        loginCounts,
      };
    } catch (error) {
      console.error('Get daily stats error:', error);
      throw error;
    }
  }

  // ດຶງລາຍຊື່ຜູ້ໃຊ້ທັງໝົດ
  async getUsers(page = 1, limit = 10, search = '') {
    try {
      const skip = (page - 1) * limit;
      const where = search
        ? {
            OR: [
              { email: { contains: search } },
              { full_name: { contains: search } },
              { student_id: { contains: search } },
            ],
          }
        : {};

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          select: {
            id: true,
            email: true,
            full_name: true,
            student_id: true,
            faculty: true,
            role: true,
            is_verified: true,
            created_at: true,
            last_login: true,
            _count: {
              select: {
                documents: true,
                chat_messages: true,
                quiz_attempts: true,
                pdf_documents: true,
              },
            },
          },
          orderBy: {
            created_at: 'desc',
          },
        }),
        prisma.user.count({ where }),
      ]);

      return {
        users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  }

  // ✅ ຟັງຊັນສ້າງຜູ້ໃຊ້ໃໝ່
  async createUser(userData) {
    try {
      const { full_name, email, password, role, student_id } = userData;

      // ກວດສອບວ່າ email ມີຢູ່ແລ້ວບໍ່
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // ກວດສອບ student_id ວ່າມີຢູ່ແລ້ວບໍ່ (ຖ້າມີການສົ່ງມາ)
      if (student_id) {
        const existingStudentId = await prisma.user.findUnique({
          where: { student_id }
        });
        if (existingStudentId) {
          throw new Error('Student ID already exists');
        }
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // ສ້າງຜູ້ໃຊ້ໃໝ່
      const user = await prisma.user.create({
        data: {
          full_name,
          email,
          password_hash: hashedPassword, // ຊື່ຟີດໃນ Schema ແມ່ນ password_hash
          role: role || 'student',
          student_id: student_id || null,
        },
        select: {
          id: true,
          email: true,
          full_name: true,
          student_id: true,
          faculty: true,
          role: true,
          is_verified: true,
          created_at: true,
        },
      });

      return user;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  // ອັບເດດບົດບາດຜູ້ໃຊ້
  async updateUserRole(userId, role) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { role },
        select: {
          id: true,
          email: true,
          full_name: true,
          role: true,
        },
      });
      return user;
    } catch (error) {
      console.error('Update user role error:', error);
      throw error;
    }
  }

  // ລຶບຜູ້ໃຊ້
  async deleteUser(userId) {
    try {
      await prisma.user.delete({
        where: { id: userId },
      });
      return { success: true };
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }

  // ສະຖິຕິການໃຊ້ງານ AI ລາຍວັນ
  async getDailyStats(days = 7) {
    try {
      const dates = [];
      const chatCounts = [];
      const userCounts = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const [chats, users] = await Promise.all([
          prisma.chatMessage.count({
            where: {
              created_at: {
                gte: date,
                lt: nextDate,
              },
            },
          }),
          prisma.user.count({
            where: {
              created_at: {
                gte: date,
                lt: nextDate,
              },
            },
          }),
        ]);

        dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        chatCounts.push(chats);
        userCounts.push(users);
      }

      return {
        dates,
        chatCounts,
        userCounts,
      };
    } catch (error) {
      console.error('Get daily stats error:', error);
      throw error;
    }
  }
}

module.exports = new AdminService();