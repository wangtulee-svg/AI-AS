const prisma = require('../lib/prisma');

class StudyPlannerService {
  // ສ້າງແຜນການຮຽນ
  async createPlan(userId, data) {
    try {
      const plan = await prisma.studyPlan.create({
        data: {
          user_id: userId,
          title: data.title,
          description: data.description,
          start_date: new Date(data.start_date),
          end_date: new Date(data.end_date),
          subject_id: data.subject_id || null,
          is_active: true,
        },
      });
      return plan;
    } catch (error) {
      console.error('Create plan error:', error);
      throw error;
    }
  }

  // ດຶງແຜນການຮຽນທັງໝົດຂອງຜູ້ໃຊ້
  async getPlans(userId, activeOnly = false) {
    try {
      const where = { user_id: userId };
      if (activeOnly) {
        where.is_active = true;
      }

      const plans = await prisma.studyPlan.findMany({
        where,
        include: {
          subject: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          tasks: {
            orderBy: {
              task_date: 'asc',
            },
          },
          _count: {
            select: {
              tasks: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      // ຄຳນວນຄວາມຄືບໜ້າ
      return plans.map(plan => {
        const totalTasks = plan.tasks.length;
        const completedTasks = plan.tasks.filter(t => t.is_completed).length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        return {
          ...plan,
          progress,
          totalTasks,
          completedTasks,
        };
      });
    } catch (error) {
      console.error('Get plans error:', error);
      throw error;
    }
  }

  // ດຶງແຜນການຮຽນສະເພາະ
  async getPlanById(planId, userId) {
    try {
      const plan = await prisma.studyPlan.findFirst({
        where: {
          id: planId,
          user_id: userId,
        },
        include: {
          subject: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          tasks: {
            orderBy: {
              task_date: 'asc',
            },
          },
        },
      });

      if (!plan) return null;

      const totalTasks = plan.tasks.length;
      const completedTasks = plan.tasks.filter(t => t.is_completed).length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...plan,
        progress,
        totalTasks,
        completedTasks,
      };
    } catch (error) {
      console.error('Get plan error:', error);
      throw error;
    }
  }

  // ອັບເດດແຜນການຮຽນ
  async updatePlan(planId, userId, data) {
    try {
      const plan = await prisma.studyPlan.updateMany({
        where: {
          id: planId,
          user_id: userId,
        },
        data: {
          title: data.title,
          description: data.description,
          start_date: data.start_date ? new Date(data.start_date) : undefined,
          end_date: data.end_date ? new Date(data.end_date) : undefined,
          subject_id: data.subject_id || null,
          is_active: data.is_active !== undefined ? data.is_active : undefined,
        },
      });
      return plan;
    } catch (error) {
      console.error('Update plan error:', error);
      throw error;
    }
  }

  // ລຶບແຜນການຮຽນ
  async deletePlan(planId, userId) {
    try {
      // ລຶບ tasks ກ່ອນ
      await prisma.studyTask.deleteMany({
        where: { study_plan_id: planId },
      });
      
      const plan = await prisma.studyPlan.deleteMany({
        where: {
          id: planId,
          user_id: userId,
        },
      });
      return plan;
    } catch (error) {
      console.error('Delete plan error:', error);
      throw error;
    }
  }

  // ສ້າງ Task
  async createTask(planId, userId, data) {
    try {
      // ກວດສອບວ່າແຜນການຮຽນເປັນຂອງຜູ້ໃຊ້
      const plan = await prisma.studyPlan.findFirst({
        where: {
          id: planId,
          user_id: userId,
        },
      });

      if (!plan) {
        throw new Error('Plan not found');
      }

      const task = await prisma.studyTask.create({
        data: {
          study_plan_id: planId,
          title: data.title,
          description: data.description,
          task_date: new Date(data.task_date),
          is_completed: data.is_completed || false,
        },
      });
      return task;
    } catch (error) {
      console.error('Create task error:', error);
      throw error;
    }
  }

  // ອັບເດດ Task
  async updateTask(taskId, userId, data) {
    try {
      // ກວດສອບວ່າ task ເປັນຂອງຜູ້ໃຊ້
      const task = await prisma.studyTask.findFirst({
        where: {
          id: taskId,
          study_plan: {
            user_id: userId,
          },
        },
      });

      if (!task) {
        throw new Error('Task not found');
      }

      const updatedTask = await prisma.studyTask.update({
        where: { id: taskId },
        data: {
          title: data.title,
          description: data.description,
          task_date: data.task_date ? new Date(data.task_date) : undefined,
          is_completed: data.is_completed !== undefined ? data.is_completed : undefined,
        },
      });
      return updatedTask;
    } catch (error) {
      console.error('Update task error:', error);
      throw error;
    }
  }

  // ລຶບ Task
  async deleteTask(taskId, userId) {
    try {
      const task = await prisma.studyTask.deleteMany({
        where: {
          id: taskId,
          study_plan: {
            user_id: userId,
          },
        },
      });
      return task;
    } catch (error) {
      console.error('Delete task error:', error);
      throw error;
    }
  }

  // ໝາຍວ່າເຮັດສຳເລັດ / ຍົກເລີກ
  async toggleTaskCompletion(taskId, userId) {
    try {
      const task = await prisma.studyTask.findFirst({
        where: {
          id: taskId,
          study_plan: {
            user_id: userId,
          },
        },
      });

      if (!task) {
        throw new Error('Task not found');
      }

      const updatedTask = await prisma.studyTask.update({
        where: { id: taskId },
        data: {
          is_completed: !task.is_completed,
        },
      });
      return updatedTask;
    } catch (error) {
      console.error('Toggle task completion error:', error);
      throw error;
    }
  }

  // ສະຖິຕິການຮຽນ
  async getStudyStats(userId) {
    try {
      const plans = await prisma.studyPlan.findMany({
        where: { user_id: userId },
        include: {
          tasks: true,
        },
      });

      const totalPlans = plans.length;
      const totalTasks = plans.reduce((acc, p) => acc + p.tasks.length, 0);
      const completedTasks = plans.reduce((acc, p) => acc + p.tasks.filter(t => t.is_completed).length, 0);
      const activePlans = plans.filter(p => p.is_active).length;
      
      // ຄຳນວນຄວາມຄືບໜ້າໂດຍລວມ
      const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // ຈັດກຸ່ມຕາມສະຖານະ
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const upcomingTasks = [];
      const overdueTasks = [];

      for (const plan of plans) {
        for (const task of plan.tasks) {
          if (task.is_completed) continue;
          const taskDate = new Date(task.task_date);
          taskDate.setHours(0, 0, 0, 0);
          
          if (taskDate < today) {
            overdueTasks.push(task);
          } else if (taskDate >= today) {
            upcomingTasks.push(task);
          }
        }
      }

      return {
        totalPlans,
        activePlans,
        totalTasks,
        completedTasks,
        overallProgress,
        upcomingTasks: upcomingTasks.length,
        overdueTasks: overdueTasks.length,
      };
    } catch (error) {
      console.error('Get study stats error:', error);
      throw error;
    }
  }

  // AI ແນະນຳແຜນການຮຽນ
  async generateAIRecommendation(userId, subjects) {
    try {
      // ດຶງຂໍ້ມູນວິຊາທີ່ເລືອກ
      const subjectData = await prisma.subject.findMany({
        where: {
          id: { in: subjects },
        },
        select: {
          id: true,
          code: true,
          name: true,
          credits: true,
        },
      });

      // ສ້າງແຜນງ່າຍໆ (ສາມາດເພີ່ມ AI ຈິງໄດ້)
      const recommendations = subjectData.map((subject, index) => {
        const daysOffset = index * 2;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + daysOffset);
        
        return {
          subject: subject,
          recommendedStart: startDate,
          estimatedHours: subject.credits * 3,
          priority: index === 0 ? 'High' : index === 1 ? 'Medium' : 'Low',
        };
      });

      return {
        success: true,
        recommendations,
        message: 'AI generated study plan recommendations',
      };
    } catch (error) {
      console.error('AI recommendation error:', error);
      throw error;
    }
  }
}

module.exports = new StudyPlannerService();