const studyPlannerService = require('../services/studyPlannerService');
const aiService = require('../services/aiService');
const prisma = require('../lib/prisma'); 
const { validationResult } = require('express-validator');

// backend/src/controllers/studyPlannerController.js

// ປ່ຽນສ່ວນການບັນທຶກ Study Plan

exports.generateAIStudyPlan = async (req, res) => {
  try {
    const { 
      subjects, 
      examDate, 
      availableHours = 2,
      startDate = null,
      title = null,
      description = null,
    } = req.body;
    const userId = req.userId;

    // ກວດສອບຂໍ້ມູນ
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one subject to study',
      });
    }

    if (!examDate) {
      return res.status(400).json({
        success: false,
        message: 'Exam date is required',
      });
    }

    // ເອີ້ນ AI ສ້າງ Study Plan
    const result = await aiService.generateStudyPlan(
      subjects,
      examDate,
      availableHours,
      startDate
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate study plan',
        error: result.error,
      });
    }

    // ✅ ບັນທຶກ Study Plan ໂດຍກົງດ້ວຍ Prisma ແທນທີ່ຈະໃຊ້ service
    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(examDate);

    const studyPlan = await prisma.studyPlan.create({
      data: {
        title: title || `Study Plan for ${subjects.map(s => s.name).join(', ')}`,
        description: description || `AI-generated study plan for ${subjects.length} subjects`,
        start_date: start,
        end_date: end,
        is_active: true,
        user_id: userId,
      },
    });

    // ບັນທຶກວຽກປະຈຳວັນ
    let taskCount = 0;
    for (const day of result.plan) {
      for (const task of day.tasks) {
        const taskDate = new Date(start);
        taskDate.setDate(taskDate.getDate() + (day.day - 1));
        
        await prisma.studyTask.create({
          data: {
            title: `${task.subject}: ${task.topic}`,
            description: `Duration: ${task.duration} minutes (${task.startTime} - ${task.endTime})`,
            task_date: taskDate,
            is_completed: false,
            study_plan_id: studyPlan.id,
          },
        });
        taskCount++;
      }
    }

    // ✅ ດຶງຂໍ້ມູນທີ່ສ້າງແລ້ວ
    const createdPlan = await prisma.studyPlan.findUnique({
      where: { id: studyPlan.id },
      include: {
        tasks: {
          orderBy: { task_date: 'asc' },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: {
        plan: createdPlan,
        days: result.days,
        totalTasks: taskCount,
        schedule: result.plan,
      },
      message: `Study plan generated successfully with ${taskCount} tasks over ${result.days} days`,
    });
  } catch (error) {
    console.error('Generate study plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate study plan',
      error: error.message,
    });
  }
};

// ສ້າງແຜນການຮຽນ
exports.createPlan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const userId = req.userId;
    const plan = await studyPlannerService.createPlan(userId, req.body);

    res.status(201).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create study plan',
      error: error.message,
    });
  }
};

// ດຶງແຜນການຮຽນທັງໝົດ
exports.getPlans = async (req, res) => {
  try {
    const userId = req.userId;
    const { active_only } = req.query;
    
    const plans = await studyPlannerService.getPlans(
      userId,
      active_only === 'true'
    );

    res.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get study plans',
      error: error.message,
    });
  }
};

// ດຶງແຜນການຮຽນສະເພາະ
exports.getPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const plan = await studyPlannerService.getPlanById(id, userId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Study plan not found',
      });
    }

    res.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get study plan',
      error: error.message,
    });
  }
};

// ອັບເດດແຜນການຮຽນ
exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const plan = await studyPlannerService.updatePlan(id, userId, req.body);

    if (plan.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Study plan not found',
      });
    }

    res.json({
      success: true,
      message: 'Study plan updated successfully',
    });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update study plan',
      error: error.message,
    });
  }
};

// ລຶບແຜນການຮຽນ
exports.deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const plan = await studyPlannerService.deletePlan(id, userId);

    if (plan.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Study plan not found',
      });
    }

    res.json({
      success: true,
      message: 'Study plan deleted successfully',
    });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete study plan',
      error: error.message,
    });
  }
};

// ສ້າງ Task
exports.createTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const task = await studyPlannerService.createTask(id, userId, req.body);

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message,
    });
  }
};

// ອັບເດດ Task
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.userId;

    const task = await studyPlannerService.updateTask(taskId, userId, req.body);

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message,
    });
  }
};

// ລຶບ Task
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.userId;

    await studyPlannerService.deleteTask(taskId, userId);

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message,
    });
  }
};

// ໝາຍວ່າເຮັດສຳເລັດ / ຍົກເລີກ
exports.toggleTaskCompletion = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.userId;

    const task = await studyPlannerService.toggleTaskCompletion(taskId, userId);

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Toggle task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle task completion',
      error: error.message,
    });
  }
};

// ສະຖິຕິການຮຽນ
exports.getStudyStats = async (req, res) => {
  try {
    const userId = req.userId;
    const stats = await studyPlannerService.getStudyStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get study stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get study stats',
      error: error.message,
    });
  }
};

// AI ແນະນຳ
exports.generateAIRecommendation = async (req, res) => {
  try {
    const userId = req.userId;
    const { subjects } = req.body;

    if (!subjects || subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one subject',
      });
    }

    const recommendation = await studyPlannerService.generateAIRecommendation(
      userId,
      subjects
    );

    res.json({
      success: true,
      data: recommendation,
    });
  } catch (error) {
    console.error('AI recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendation',
      error: error.message,
    });
  }
};