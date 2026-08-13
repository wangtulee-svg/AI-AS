const prisma = require('../lib/prisma');

class QuizService {
  // ດຶງລາຍຊື່ Quiz ທັງໝົດ
  async getQuizzes(userId, filter = {}) {
    try {
      const quizzes = await prisma.pDFQuiz.findMany({
        where: {
          pdf: {
            uploaded_by: userId,
          },
          ...(filter.subject_id && { pdf: { subject_id: filter.subject_id } }),
        },
        include: {
          pdf: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      return quizzes;
    } catch (error) {
      console.error('Get quizzes error:', error);
      throw error;
    }
  }

  // ດຶງ Quiz ສະເພາະ
  async getQuizById(quizId, userId) {
    try {
      const quiz = await prisma.pDFQuiz.findFirst({
        where: {
          id: quizId,
          pdf: {
            uploaded_by: userId,
          },
        },
        include: {
          pdf: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      return quiz;
    } catch (error) {
      console.error('Get quiz error:', error);
      throw error;
    }
  }

  // ບັນທຶກຜົນການເຮັດ Quiz
  async saveQuizAttempt(userId, quizId, score, totalQuestions, answers) {
    try {
      const attempt = await prisma.quizAttempt.create({
        data: {
          user_id: userId,
          quiz_id: quizId,
          score: score,
          total_questions: totalQuestions,
          answers: answers,
          completed_at: new Date(),
        },
      });

      return attempt;
    } catch (error) {
      console.error('Save quiz attempt error:', error);
      throw error;
    }
  }

  // ດຶງປະຫວັດການເຮັດ Quiz
  async getQuizHistory(userId, quizId = null) {
    try {
      const where = { user_id: userId };
      if (quizId) {
        where.quiz_id = quizId;
      }

      const attempts = await prisma.quizAttempt.findMany({
        where,
        include: {
          quiz: {
            include: {
              pdf: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
        orderBy: {
          completed_at: 'desc',
        },
      });

      return attempts;
    } catch (error) {
      console.error('Get quiz history error:', error);
      throw error;
    }
  }

  // ສະຖິຕິການເຮັດ Quiz
  async getQuizStats(userId) {
  try {
    const [
      totalQuizzes,
      totalAttempts,
      completedAttempts,
      averageScore,
      totalQuestions,
    ] = await Promise.all([
      prisma.quiz.count({
        where: { created_by: userId },
      }),
      prisma.quizAttempt.count({
        where: { user_id: userId },
      }),
      prisma.quizAttempt.count({
        where: {
          user_id: userId,
          completed_at: { not: null },
        },
      }),
      prisma.quizAttempt.aggregate({
        where: { user_id: userId },
        _avg: { score: true },
      }),
      prisma.question.count({
        where: {
          quiz: {
            created_by: userId,
          },
        },
      }),
    ]);

    const completionRate = totalAttempts > 0 
      ? Math.round((completedAttempts / totalAttempts) * 100) 
      : 0;

    return {
      totalQuizzes,
      totalAttempts,
      completedAttempts,
      completionRate,
      averageScore: Math.round(averageScore._avg.score || 0),
      totalQuestions,
    };
  } catch (error) {
    console.error('Get quiz stats error:', error);
    throw error;
  }
}
}

module.exports = new QuizService();