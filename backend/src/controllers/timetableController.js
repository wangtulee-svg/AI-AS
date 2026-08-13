const timetableService = require('../services/timetableService');
const { validationResult } = require('express-validator');

// ສ້າງຕາຕະລາງ
exports.createSchedule = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const userId = req.userId;
    const schedule = await timetableService.createSchedule(userId, req.body);

    res.status(201).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create schedule',
      error: error.message,
    });
  }
};

// ດຶງຕາຕະລາງທັງໝົດ
exports.getSchedules = async (req, res) => {
  try {
    const userId = req.userId;
    const { semester } = req.query;

    const schedules = await timetableService.getSchedules(userId, semester);

    res.json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get schedules',
      error: error.message,
    });
  }
};

// ດຶງຕາຕະລາງແບບຈັດກຸ່ມ
exports.getGroupedSchedules = async (req, res) => {
  try {
    const userId = req.userId;
    const { semester } = req.query;

    const grouped = await timetableService.getGroupedSchedules(userId, semester);

    res.json({
      success: true,
      data: grouped,
    });
  } catch (error) {
    console.error('Get grouped schedules error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get grouped schedules',
      error: error.message,
    });
  }
};

// ດຶງຕາຕະລາງສະເພາະ
exports.getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const schedule = await timetableService.getScheduleById(id, userId);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found',
      });
    }

    res.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get schedule',
      error: error.message,
    });
  }
};

// ອັບເດດຕາຕະລາງ
exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const schedule = await timetableService.updateSchedule(id, userId, req.body);

    if (schedule.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found',
      });
    }

    res.json({
      success: true,
      message: 'Schedule updated successfully',
    });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update schedule',
      error: error.message,
    });
  }
};

// ລຶບຕາຕະລາງ
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const schedule = await timetableService.deleteSchedule(id, userId);

    if (schedule.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found',
      });
    }

    res.json({
      success: true,
      message: 'Schedule deleted successfully',
    });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete schedule',
      error: error.message,
    });
  }
};

// ສະຖິຕິຕາຕະລາງ
exports.getTimetableStats = async (req, res) => {
  try {
    const userId = req.userId;
    const stats = await timetableService.getTimetableStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get timetable stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get timetable stats',
      error: error.message,
    });
  }
};