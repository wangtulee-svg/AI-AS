const quizService = require('../services/quizService');
const aiService = require('../services/aiService');
const prisma = require('../lib/prisma');
const { validationResult } = require('express-validator');

// ✅ ຟັງຊັນສ້າງ Quiz ດ້ວຍ AI
exports.generateQuiz = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
        message: 'Validation failed',
      });
    }

    const { 
      topic, 
      difficulty = 'medium', 
      numQuestions = 5,
      pdfId = null,
      subjectId = null,
      title = null,
      description = null,
    } = req.body;
    const userId = req.userId;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required to generate quiz',
      });
    }

    // ກວດສອບວ່າ PDF ມີຢູ່ ແລະ ເປັນຂອງຜູ້ໃຊ້
    if (pdfId) {
      const pdf = await prisma.pDFDocument.findFirst({
        where: {
          id: pdfId,
          uploaded_by: userId,
        },
      });
      if (!pdf) {
        return res.status(404).json({
          success: false,
          message: 'PDF document not found or not owned by you',
        });
      }
    }

    // ເອີ້ນ AI ສ້າງ Quiz
    const result = await aiService.generateQuiz(
      topic,
      difficulty,
      numQuestions,
      subjectId,
      pdfId
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate quiz',
        error: result.error,
      });
    }

    // ບັນທຶກ Quiz ໃນ Database
    const quiz = await prisma.quiz.create({
      data: {
        title: title || `Quiz: ${topic}`,
        description: description || `Auto-generated quiz about ${topic}`,
        difficulty: difficulty,
        total_questions: result.totalQuestions,
        subject_id: subjectId,
        created_by: userId,
        is_published: true,
      },
    });

    // ບັນທຶກຄຳຖາມ
    for (const q of result.questions) {
      await prisma.question.create({
        data: {
          quiz_id: quiz.id,
          question_text: q.question,
          option_a: q.options[0]?.replace(/^[A-D]\.\s*/, '') || '',
          option_b: q.options[1]?.replace(/^[A-D]\.\s*/, '') || '',
          option_c: q.options[2]?.replace(/^[A-D]\.\s*/, '') || '',
          option_d: q.options[3]?.replace(/^[A-D]\.\s*/, '') || '',
          correct_answer: q.correct_answer,
          explanation: q.explanation || '',
          marks: 1,
        },
      });
    }

    // ດຶງຂໍ້ມູນ Quiz ທີ່ສ້າງແລ້ວ
    const createdQuiz = await prisma.quiz.findUnique({
      where: { id: quiz.id },
      include: {
        questions: {
          orderBy: { question_order: 'asc' },
        },
        creator: {
          select: { id: true, full_name: true },
        },
        subject: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: createdQuiz,
      message: `Quiz generated successfully with ${result.totalQuestions} questions`,
    });
  } catch (error) {
    console.error('Generate quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate quiz',
      error: error.message,
    });
  }
};

// ດຶງລາຍຊື່ Quiz
exports.getQuizzes = async (req, res) => {
  try {
    const userId = req.userId;
    const { subject_id, limit = 10, offset = 0 } = req.query;

    const where = { created_by: userId };
    if (subject_id) {
      where.subject_id = subject_id;
    }

    const quizzes = await prisma.quiz.findMany({
      where,
      include: {
        subject: {
          select: { id: true, code: true, name: true },
        },
        creator: {
          select: { id: true, full_name: true },
        },
        _count: {
          select: {
            questions: true,
            quiz_attempts: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    // ✅ ກວດສອບວ່າມີຂໍ້ມູນ
    console.log(`📝 Found ${quizzes.length} quizzes for user ${userId}`);

    res.json({
      success: true,
      data: quizzes,
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quizzes',
      error: error.message,
    });
  }
};

// ດຶງ Quiz ສະເພາະ
exports.getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    console.log(`📝 Fetching quiz with ID: ${id} for user: ${userId}`);

    const quiz = await prisma.quiz.findFirst({
      where: {
        id: id,
        OR: [
          { created_by: userId },
          { is_published: true },
        ],
      },
      include: {
        questions: {
          orderBy: { question_order: 'asc' },
        },
        creator: {
          select: { id: true, full_name: true },
        },
        subject: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    if (!quiz) {
      console.log(`❌ Quiz not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // ກວດສອບວ່າຜູ້ໃຊ້ໄດ້ເຮັດ Quiz ນີ້ແລ້ວບໍ່
    const attempt = await prisma.quizAttempt.findFirst({
      where: {
        user_id: userId,
        quiz_id: id,
      },
      orderBy: { created_at: 'desc' },
    });

    res.json({
      success: true,
      data: {
        ...quiz,
        hasAttempt: !!attempt,
        lastAttempt: attempt,
      },
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quiz',
      error: error.message,
    });
  }
};

// ສົ່ງຄຳຕອບ Quiz
exports.submitQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;
    const userId = req.userId;

    console.log(`📝 Submitting quiz: ${id} for user: ${userId}`);
    console.log(`📝 Answers:`, answers);

    // ກວດສອບວ່າມີຄຳຕອບ
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Answers are required',
      });
    }

    // ດຶງ Quiz ພ້ອມຄຳຖາມ
    const quiz = await prisma.quiz.findUnique({
      where: { id: id },
      include: {
        questions: {
          orderBy: { question_order: 'asc' },
        },
      },
    });

    if (!quiz) {
      console.log(`❌ Quiz not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // ກວດສອບວ່າຜູ້ໃຊ້ມີສິດເຮັດ Quiz ນີ້
    if (quiz.created_by !== userId && !quiz.is_published) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to take this quiz',
      });
    }

    // ຄຳນວນຄະແນນ
    let correctCount = 0;
    const questions = quiz.questions;
    const results = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const userAnswer = answers[i] || null;
      const isCorrect = userAnswer === q.correct_answer;

      if (isCorrect) {
        correctCount++;
      }

      results.push({
        questionId: q.id,
        question: q.question_text,
        options: [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean),
        correctAnswer: q.correct_answer,
        userAnswer: userAnswer,
        isCorrect: isCorrect,
        explanation: q.explanation || null,
      });
    }

    const totalQuestions = questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);

    console.log(`✅ Score: ${score}% (${correctCount}/${totalQuestions})`);

    // ບັນທຶກຜົນການທຳ
    const attempt = await prisma.quizAttempt.create({
      data: {
        user_id: userId,
        quiz_id: id,
        score: correctCount,
        total_questions: totalQuestions,
        completed_at: new Date(),
        answers: {
          results: results,
          total: totalQuestions,
          correct: correctCount,
          score: score,
        },
      },
    });

    res.json({
      success: true,
      data: {
        attemptId: attempt.id,
        score: correctCount,
        totalQuestions: totalQuestions,
        percentage: score,
        passed: score >= 70,
        results: results,
      },
    });
  } catch (error) {
    console.error('❌ Submit quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: error.message,
    });
  }
};

// ດຶງປະຫວັດການເຮັດ Quiz
exports.getQuizHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { quiz_id } = req.query;

    const history = await quizService.getQuizHistory(userId, quiz_id);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Get quiz history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quiz history',
      error: error.message,
    });
  }
};

// ດຶງສະຖິຕິ
exports.getQuizStats = async (req, res) => {
  try {
    const userId = req.userId;

    // ດຶງຂໍ້ມູນທັງໝົດ
    const [
      totalQuizzes,
      totalAttempts,
      completedAttempts,
      averageScore,
      totalQuestions,
    ] = await Promise.all([
      // ຈຳນວນ Quiz ທັງໝົດ
      prisma.quiz.count({
        where: { created_by: userId },
      }),
      // ຈຳນວນການທຳ Quiz ທັງໝົດ
      prisma.quizAttempt.count({
        where: { user_id: userId },
      }),
      // ຈຳນວນການທຳ Quiz ທີ່ສຳເລັດ
      prisma.quizAttempt.count({
        where: {
          user_id: userId,
          completed_at: { not: null },
        },
      }),
      // ຄະແນນສະເລ່ຍ
      prisma.quizAttempt.aggregate({
        where: { user_id: userId },
        _avg: { score: true },
      }),
      // ຈຳນວນຄຳຖາມທັງໝົດ
      prisma.question.count({
        where: {
          quiz: {
            created_by: userId,
          },
        },
      }),
    ]);

    // ຄຳນວນອັດຕາການສຳເລັດ
    const completionRate = totalAttempts > 0 
      ? Math.round((completedAttempts / totalAttempts) * 100) 
      : 0;

    res.json({
      success: true,
      data: {
        totalQuizzes,
        totalAttempts,
        completedAttempts,
        completionRate,
        averageScore: Math.round(averageScore._avg.score || 0),
        totalQuestions,
      },
    });
  } catch (error) {
    console.error('Get quiz stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quiz stats',
      error: error.message,
    });
  }
};
