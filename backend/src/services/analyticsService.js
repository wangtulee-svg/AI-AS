// backend/src/services/analyticsService.js

const prisma = require('../lib/prisma');

class AnalyticsService {
  // ============================================
  // ສະຖິຕິທົ່ວໄປຂອງຜູ້ໃຊ້
  // ============================================
  async getUserStats(userId) {
    try {
      const [totalQuizzes, totalAttempts, totalDocuments, totalChats] = await Promise.all([
        prisma.quiz.count({
          where: { created_by: userId },
        }),
        prisma.quizAttempt.count({
          where: { user_id: userId },
        }),
        prisma.document.count({
          where: { uploaded_by: userId },
        }),
        prisma.chatMessage.count({
          where: { user_id: userId },
        }),
      ]);

      // ຄະແນນສະເລ່ຍ
      const avgScoreResult = await prisma.quizAttempt.aggregate({
        where: { user_id: userId },
        _avg: { score: true },
      });

      // ຈຳນວນ Quiz ທີ່ເຮັດສຳເລັດ
      const completedQuizzes = await prisma.quizAttempt.count({
        where: {
          user_id: userId,
          completed_at: { not: null },
        },
      });

      return {
        totalQuizzes,
        totalAttempts,
        totalDocuments,
        totalChats,
        averageScore: Math.round(avgScoreResult._avg.score || 0),
        completedQuizzes,
        overallProgress: totalQuizzes > 0 ? Math.round((completedQuizzes / totalQuizzes) * 100) : 0,
      };
    } catch (error) {
      console.error('Get user stats error:', error);
      throw error;
    }
  }

  // ============================================
  // ສະຖິຕິຕາມວິຊາ
  // ============================================
  async getSubjectStats(userId) {
    try {
      // ດຶງວິຊາທັງໝົດຂອງຜູ້ໃຊ້
      const enrollments = await prisma.enrollment.findMany({
        where: { user_id: userId },
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

      const subjectStats = [];
      for (const enrollment of enrollments) {
        const subject = enrollment.subject;
        
        // ດຶງຂໍ້ມູນ Quiz ທີ່ກ່ຽວຂ້ອງ
        const quizzes = await prisma.quiz.findMany({
          where: {
            subject_id: subject.id,
            is_published: true,
          },
          include: {
            quiz_attempts: {
              where: { user_id: userId },
              orderBy: { created_at: 'desc' },
              take: 1,
            },
          },
        });

        // ດຶງຂໍ້ມູນຄວາມຄືບໜ້າ
        const progress = await prisma.learningProgress.findUnique({
          where: {
            user_id_subject_id: {
              user_id: userId,
              subject_id: subject.id,
            },
          },
        });

        const totalQuizzes = quizzes.length;
        const completedQuizzes = quizzes.filter(q => q.quiz_attempts.length > 0).length;
        const bestScore = quizzes.reduce((max, q) => {
          const score = q.quiz_attempts[0]?.score || 0;
          return Math.max(max, score);
        }, 0);

        subjectStats.push({
          subjectId: subject.id,
          code: subject.code,
          name: subject.name,
          credits: subject.credits,
          totalQuizzes,
          completedQuizzes,
          progress: progress?.progress || 0,
          bestScore,
          averageScore: Math.round(
            quizzes.reduce((sum, q) => sum + (q.quiz_attempts[0]?.score || 0), 0) / (quizzes.length || 1)
          ),
          status: enrollment.status,
        });
      }

      return subjectStats;
    } catch (error) {
      console.error('Get subject stats error:', error);
      throw error;
    }
  }

  // ============================================
  // ປະຫວັດການເຮັດ Quiz (ລາຍງານ)
  // ============================================
  async getQuizHistory(userId, limit = 10) {
    try {
      const attempts = await prisma.quizAttempt.findMany({
        where: { user_id: userId },
        include: {
          quiz: {
            select: {
              id: true,
              title: true,
              difficulty: true,
              subject: {
                select: { id: true, code: true, name: true },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
        take: limit,
      });

      return attempts.map(attempt => ({
        id: attempt.id,
        quizId: attempt.quiz_id,
        quizTitle: attempt.quiz.title,
        difficulty: attempt.quiz.difficulty,
        subject: attempt.quiz.subject,
        score: attempt.score,
        totalQuestions: attempt.total_questions,
        percentage: Math.round((attempt.score / attempt.total_questions) * 100),
        completedAt: attempt.completed_at,
        createdAt: attempt.created_at,
      }));
    } catch (error) {
      console.error('Get quiz history error:', error);
      throw error;
    }
  }

  // ============================================
  // ວິເຄາະຈຸດອ່ອນ/ແຂງ
  // ============================================
  async getStrengthsAndWeaknesses(userId) {
    try {
      // ດຶງຂໍ້ມູນ Quiz ທັງໝົດທີ່ເຮັດແລ້ວ
      const attempts = await prisma.quizAttempt.findMany({
        where: { user_id: userId },
        include: {
          quiz: {
            include: {
              subject: true,
            },
          },
        },
      });

      // ຈັດກຸ່ມຕາມວິຊາ
      const subjectScores = {};
      for (const attempt of attempts) {
        const subjectId = attempt.quiz.subject_id;
        const subjectName = attempt.quiz.subject?.name || 'Unknown';
        const score = (attempt.score / attempt.total_questions) * 100;

        if (!subjectScores[subjectId]) {
          subjectScores[subjectId] = {
            name: subjectName,
            scores: [],
            total: 0,
          };
        }
        subjectScores[subjectId].scores.push(score);
        subjectScores[subjectId].total++;
      }

      // ຄຳນວນຄ່າສະເລ່ຍ
      const results = Object.entries(subjectScores).map(([id, data]) => {
        const avg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
        return {
          subjectId: id,
          subjectName: data.name,
          averageScore: Math.round(avg),
          attempts: data.total,
          level: avg >= 70 ? 'strong' : avg >= 50 ? 'medium' : 'weak',
        };
      });

      // ແຍກຈຸດອ່ອນ ແລະ ແຂງ
      const strengths = results.filter(r => r.level === 'strong').sort((a, b) => b.averageScore - a.averageScore);
      const weaknesses = results.filter(r => r.level === 'weak').sort((a, b) => a.averageScore - b.averageScore);

      return {
        strengths,
        weaknesses,
        allSubjects: results,
      };
    } catch (error) {
      console.error('Get strengths/weaknesses error:', error);
      throw error;
    }
  }

  // ============================================
  // ສະຖິຕິການໃຊ້ງານປະຈຳວັນ (ສຳລັບ Charts)
  // ============================================
  async getDailyActivity(userId, days = 30) {
    try {
      const dates = [];
      const quizData = [];
      const chatData = [];
      const documentData = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const [quizzes, chats, documents] = await Promise.all([
          prisma.quizAttempt.count({
            where: {
              user_id: userId,
              created_at: {
                gte: date,
                lt: nextDate,
              },
            },
          }),
          prisma.chatMessage.count({
            where: {
              user_id: userId,
              created_at: {
                gte: date,
                lt: nextDate,
              },
            },
          }),
          prisma.document.count({
            where: {
              uploaded_by: userId,
              created_at: {
                gte: date,
                lt: nextDate,
              },
            },
          }),
        ]);

        dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        quizData.push(quizzes);
        chatData.push(chats);
        documentData.push(documents);
      }

      return {
        dates,
        quizData,
        chatData,
        documentData,
      };
    } catch (error) {
      console.error('Get daily activity error:', error);
      throw error;
    }
  }

  // ============================================
  // AI ແນະນຳ (Recommendations)
  // ============================================
  async getRecommendations(userId) {
    try {
      const { weaknesses, strengths } = await this.getStrengthsAndWeaknesses(userId);
      
      const recommendations = [];

      // ແນະນຳຈາກຈຸດອ່ອນ
      if (weaknesses.length > 0) {
        recommendations.push({
          type: 'weakness',
          title: 'ວິຊາທີ່ຕ້ອງປັບປຸງ',
          message: `ທ່ານຄວນທົບທວນວິຊາ ${weaknesses.map(w => w.subjectName).join(', ')}`,
          subjects: weaknesses,
        });
      }

      // ແນະນຳຈາກຈຸດແຂງ
      if (strengths.length > 0) {
        recommendations.push({
          type: 'strength',
          title: 'ວິຊາທີ່ເກັ່ງ',
          message: `ທ່ານເກັ່ງວິຊາ ${strengths.map(s => s.subjectName).join(', ')} ສືບຕໍ່ຮັກສາລະດັບນີ້ໄວ້!`,
          subjects: strengths,
        });
      }

      // ແນະນຳທົ່ວໄປ
      if (weaknesses.length === 0 && strengths.length === 0) {
        recommendations.push({
          type: 'general',
          title: 'ເລີ່ມຕົ້ນການຮຽນ',
          message: 'ເລີ່ມເຮັບ Quiz ເພື່ອໃຫ້ຂ້ອຍສາມາດວິເຄາະ ແລະ ແນະນຳທ່ານໄດ້!',
        });
      }

      return recommendations;
    } catch (error) {
      console.error('Get recommendations error:', error);
      return [];
    }
  }
}

module.exports = new AnalyticsService();