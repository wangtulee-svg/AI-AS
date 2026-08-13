// backend/src/controllers/studentController.js

const prisma = require('../lib/prisma');

// ດຶງສະຖິຕິ
exports.getStats = async (req, res) => {
  try {
    const userId = req.userId;

    const [
      totalSubjects,
      totalDocuments,
      totalChats,
      totalQuizzes,
      averageScore,
      totalAttempts,
    ] = await Promise.all([
      prisma.enrollment.count({
        where: { user_id: userId, status: 'enrolled' },
      }),
      prisma.document.count({
        where: { uploaded_by: userId },
      }),
      prisma.chatMessage.count({
        where: { user_id: userId },
      }),
      prisma.quizAttempt.count({
        where: { user_id: userId },
      }),
      prisma.quizAttempt.aggregate({
        where: { user_id: userId },
        _avg: { score: true },
      }),
      prisma.quizAttempt.count({
        where: { user_id: userId },
      }),
    ]);

    // ຄຳນວນ GPA (ຈຳລອງ)
    const gpa = totalAttempts > 0 
      ? (averageScore._avg.score || 0) / 25 // ປະມານ 0-4
      : 0;

    res.json({
      success: true,
      data: {
        enrolledSubjects: totalSubjects,
        documents: totalDocuments,
        chats: totalChats,
        quizzes: totalQuizzes,
        gpa: Math.round(gpa * 10) / 10,
        averageScore: Math.round(averageScore._avg.score || 0),
        totalAttempts,
      },
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

// ດຶງກິດຈະກຳຫຼ້າສຸດ
exports.getRecentActivities = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 5 } = req.query;

    // ດຶງຂໍ້ມູນຈາກຫຼາຍຕາຕະລາງ
    const [quizAttempts, chatMessages, documents] = await Promise.all([
      prisma.quizAttempt.findMany({
        where: { user_id: userId },
        take: parseInt(limit),
        orderBy: { created_at: 'desc' },
        include: {
          quiz: {
            select: { title: true },
          },
        },
      }),
      prisma.chatMessage.findMany({
        where: { user_id: userId },
        take: parseInt(limit),
        orderBy: { created_at: 'desc' },
      }),
      prisma.document.findMany({
        where: { uploaded_by: userId },
        take: parseInt(limit),
        orderBy: { created_at: 'desc' },
      }),
    ]);

    // ຈັດຮູບແບບຂໍ້ມູນ
    const activities = [];

    quizAttempts.forEach(attempt => {
      activities.push({
        type: 'quiz',
        icon: 'Trophy',
        color: 'bg-purple-500',
        message: `Completed quiz: ${attempt.quiz.title}`,
        score: `${attempt.score}/${attempt.total_questions}`,
        time: attempt.created_at,
      });
    });

    chatMessages.slice(0, 3).forEach(msg => {
      activities.push({
        type: 'chat',
        icon: 'MessageCircle',
        color: 'bg-blue-500',
        message: `AI Chat: ${msg.message.substring(0, 50)}${msg.message.length > 50 ? '...' : ''}`,
        time: msg.created_at,
      });
    });

    documents.slice(0, 3).forEach(doc => {
      activities.push({
        type: 'document',
        icon: 'FileText',
        color: 'bg-emerald-500',
        message: `Uploaded: ${doc.title}`,
        time: doc.created_at,
      });
    });

    // ຮຽງຕາມເວລາ
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    activities.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activities',
      error: error.message,
    });
  }
};

// ດຶງຄວາມຄືບໜ້າຂອງວິຊາ
exports.getSubjectProgress = async (req, res) => {
  try {
    const userId = req.userId;

    const enrollments = await prisma.enrollment.findMany({
      where: { user_id: userId, status: 'enrolled' },
      include: {
        subject: {
          select: {
            id: true,
            code: true,
            name: true,
            credits: true,
          },
        },
      },
    });

    const progress = await Promise.all(
      enrollments.map(async (enrollment) => {
        // ນັບຈຳນວນ Quiz ທັງໝົດ
        const totalQuizzes = await prisma.quiz.count({
          where: { subject_id: enrollment.subject_id },
        });

        // ນັບຈຳນວນ Quiz ທີ່ເຮັດແລ້ວ
        const completedQuizzes = await prisma.quizAttempt.count({
          where: {
            user_id: userId,
            quiz: { subject_id: enrollment.subject_id },
            completed_at: { not: null },
          },
        });

        // ຄຳນວນຄວາມຄືບໜ້າ
        const progressPercentage = totalQuizzes > 0 
          ? Math.round((completedQuizzes / totalQuizzes) * 100)
          : 0;

        return {
          subjectId: enrollment.subject_id,
          code: enrollment.subject.code,
          name: enrollment.subject.name,
          credits: enrollment.subject.credits,
          progress: progressPercentage,
          totalQuizzes,
          completedQuizzes,
        };
      })
    );

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get progress',
      error: error.message,
    });
  }
};

// ດຶງຕາຕະລາງຮຽນ
exports.getUpcomingClasses = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 3 } = req.query;

    const now = new Date();
    const classes = await prisma.timetable.findMany({
      where: {
        user_id: userId,
        end_time: { gte: now },
      },
      include: {
        subject: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: { start_time: 'asc' },
      take: parseInt(limit),
    });

    const formattedClasses = classes.map(cls => ({
      id: cls.id,
      name: cls.subject.name,
      code: cls.subject.code,
      time: `${new Date(cls.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${new Date(cls.end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
      room: cls.room || 'TBA',
      day: new Date(cls.start_time).toLocaleDateString('en-US', { weekday: 'short' }),
      isToday: new Date(cls.start_time).toDateString() === now.toDateString(),
    }));

    res.json({
      success: true,
      data: formattedClasses,
    });
  } catch (error) {
    console.error('Get upcoming classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get upcoming classes',
      error: error.message,
    });
  }
};