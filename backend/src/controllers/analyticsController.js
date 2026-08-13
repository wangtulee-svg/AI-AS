// backend/src/controllers/analyticsController.js

const analyticsService = require('../services/analyticsService');

// ============================================
// ສະຖິຕິທົ່ວໄປ
// ============================================
exports.getStats = async (req, res) => {
  try {
    const userId = req.userId;
    const stats = await analyticsService.getUserStats(userId);
    
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

// ============================================
// ສະຖິຕິຕາມວິຊາ
// ============================================
exports.getSubjectStats = async (req, res) => {
  try {
    const userId = req.userId;
    const stats = await analyticsService.getSubjectStats(userId);
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get subject stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subject stats',
      error: error.message,
    });
  }
};

// ============================================
// ປະຫວັດການເຮັດ Quiz
// ============================================
exports.getQuizHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 10 } = req.query;
    const history = await analyticsService.getQuizHistory(userId, parseInt(limit));
    
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

// ============================================
// ຈຸດອ່ອນ/ແຂງ
// ============================================
exports.getStrengthsAndWeaknesses = async (req, res) => {
  try {
    const userId = req.userId;
    const result = await analyticsService.getStrengthsAndWeaknesses(userId);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get strengths/weaknesses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze strengths and weaknesses',
      error: error.message,
    });
  }
};

// ============================================
// ກິດຈະກຳປະຈຳວັນ (ສຳລັບ Charts)
// ============================================
exports.getDailyActivity = async (req, res) => {
  try {
    const userId = req.userId;
    const { days = 30 } = req.query;
    const activity = await analyticsService.getDailyActivity(userId, parseInt(days));
    
    res.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    console.error('Get daily activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get daily activity',
      error: error.message,
    });
  }
};

// ============================================
// AI ແນະນຳ
// ============================================
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.userId;
    const recommendations = await analyticsService.getRecommendations(userId);
    
    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message,
    });
  }
};

// ============================================
// Dashboard Overview (ລວມທັງໝົດ)
// ============================================
exports.getDashboardOverview = async (req, res) => {
  try {
    const userId = req.userId;
    
    const [stats, subjectStats, activity, recommendations] = await Promise.all([
      analyticsService.getUserStats(userId),
      analyticsService.getSubjectStats(userId),
      analyticsService.getDailyActivity(userId, 7),
      analyticsService.getRecommendations(userId),
    ]);

    res.json({
      success: true,
      data: {
        stats,
        subjects: subjectStats,
        activity,
        recommendations,
      },
    });
  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard overview',
      error: error.message,
    });
  }
};