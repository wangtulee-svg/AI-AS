const prisma = require('../lib/prisma');

class TimetableService {
  // ສ້າງຕາຕະລາງ
  async createSchedule(userId, data) {
    try {
      const schedule = await prisma.timetable.create({
        data: {
          user_id: userId,
          subject_id: data.subject_id,
          day_of_week: data.day_of_week,
          start_time: new Date(data.start_time),
          end_time: new Date(data.end_time),
          room: data.room || null,
          semester: data.semester || '2024-S1',
        },
      });
      return schedule;
    } catch (error) {
      console.error('Create schedule error:', error);
      throw error;
    }
  }

  // ດຶງຕາຕະລາງທັງໝົດຂອງຜູ້ໃຊ້
  async getSchedules(userId, semester = null) {
    try {
      const where = { user_id: userId };
      if (semester) {
        where.semester = semester;
      }

      const schedules = await prisma.timetable.findMany({
        where,
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
        orderBy: [
          { day_of_week: 'asc' },
          { start_time: 'asc' },
        ],
      });

      return schedules;
    } catch (error) {
      console.error('Get schedules error:', error);
      throw error;
    }
  }

  // ດຶງຕາຕະລາງສະເພາະ
  async getScheduleById(scheduleId, userId) {
    try {
      const schedule = await prisma.timetable.findFirst({
        where: {
          id: scheduleId,
          user_id: userId,
        },
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
      return schedule;
    } catch (error) {
      console.error('Get schedule error:', error);
      throw error;
    }
  }

  // ອັບເດດຕາຕະລາງ
  async updateSchedule(scheduleId, userId, data) {
    try {
      const schedule = await prisma.timetable.updateMany({
        where: {
          id: scheduleId,
          user_id: userId,
        },
        data: {
          subject_id: data.subject_id,
          day_of_week: data.day_of_week,
          start_time: data.start_time ? new Date(data.start_time) : undefined,
          end_time: data.end_time ? new Date(data.end_time) : undefined,
          room: data.room || null,
          semester: data.semester || undefined,
        },
      });
      return schedule;
    } catch (error) {
      console.error('Update schedule error:', error);
      throw error;
    }
  }

  // ລຶບຕາຕະລາງ
  async deleteSchedule(scheduleId, userId) {
    try {
      const schedule = await prisma.timetable.deleteMany({
        where: {
          id: scheduleId,
          user_id: userId,
        },
      });
      return schedule;
    } catch (error) {
      console.error('Delete schedule error:', error);
      throw error;
    }
  }

  // ດຶງຕາຕະລາງແບບຈັດກຸ່ມຕາມມື້
  async getGroupedSchedules(userId, semester = null) {
    try {
      const schedules = await this.getSchedules(userId, semester);
      
      const grouped = {
        MON: [],
        TUE: [],
        WED: [],
        THU: [],
        FRI: [],
        SAT: [],
        SUN: [],
      };

      for (const schedule of schedules) {
        const day = schedule.day_of_week;
        if (grouped[day]) {
          grouped[day].push(schedule);
        }
      }

      return grouped;
    } catch (error) {
      console.error('Get grouped schedules error:', error);
      throw error;
    }
  }

  // ສະຖິຕິຕາຕະລາງ
  async getTimetableStats(userId) {
    try {
      const total = await prisma.timetable.count({
        where: { user_id: userId },
      });

      const days = await prisma.timetable.groupBy({
        by: ['day_of_week'],
        where: { user_id: userId },
        _count: {
          day_of_week: true,
        },
      });

      return {
        total,
        days,
      };
    } catch (error) {
      console.error('Get timetable stats error:', error);
      throw error;
    }
  }
}

module.exports = new TimetableService();