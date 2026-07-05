const Class = require('../../models/Class');
const Schedule = require('../../models/Schedule');
const Session = require('../../models/Session');

/**
 * Tu dong sinh cac buoi hoc cho lop dua tren startDate, endDate va lich hoc (schedules)
 * @param {String} classId - ID cua lop hoc
 * @param {String} teacherId - ID cua giao vien
 * @returns {Object} - { createdCount, existingCount }
 */
const ensureSessionsForClass = async (classId, teacherId) => {
  const cls = await Class.findById(classId);
  if (!cls) return { createdCount: 0, existingCount: 0 };

  if (cls.teacherId.toString() !== teacherId.toString()) {
    return { createdCount: 0, existingCount: 0 };
  }

  if (!cls.startDate || !cls.endDate) {
    return { createdCount: 0, existingCount: 0 };
  }

  const schedules = await Schedule.find({
    classId,
    teacherId,
    status: 'active'
  });

  if (schedules.length === 0) {
    return { createdCount: 0, existingCount: 0 };
  }

  const targetTotal = cls.totalSessions || 24;
  let createdCount = 0;
  let existingCount = 0;
  let generatedOrFoundCount = 0;

  const dayMap = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6
  };

  const schedulesByDay = {};
  schedules.forEach(sch => {
    const dayIndex = dayMap[sch.dayOfWeek];
    if (dayIndex !== undefined) {
      if (!schedulesByDay[dayIndex]) schedulesByDay[dayIndex] = [];
      schedulesByDay[dayIndex].push(sch);
    }
  });

  const current = new Date(cls.startDate);
  current.setUTCHours(0, 0, 0, 0);

  const maxLoops = 365 * 2; // Prevent infinite loop
  let loops = 0;

  while (generatedOrFoundCount < targetTotal && loops < maxLoops) {
    const dayIndex = current.getUTCDay();
    const daySchedules = schedulesByDay[dayIndex];

    if (daySchedules && daySchedules.length > 0) {
      const sessionDate = new Date(current);
      sessionDate.setUTCHours(0, 0, 0, 0);

      const d = String(sessionDate.getUTCDate()).padStart(2, '0');
      const m = String(sessionDate.getUTCMonth() + 1).padStart(2, '0');
      const y = sessionDate.getUTCFullYear();

      for (const schedule of daySchedules) {
        if (generatedOrFoundCount >= targetTotal) break;

        const existingSession = await Session.findOne({
          classId,
          scheduleId: schedule._id,
          sessionDate
        });

        if (existingSession) {
          existingCount++;
          generatedOrFoundCount++;
        } else {
          try {
            await Session.create({
              classId,
              scheduleId: schedule._id,
              sessionDate,
              topic: `Buổi học ngày ${d}/${m}/${y}`,
              status: 'SCHEDULED'
            });
            createdCount++;
            generatedOrFoundCount++;
          } catch (err) {
            if (err.code === 11000) {
              existingCount++;
              generatedOrFoundCount++;
            } else {
              console.error('Error creating session:', err);
            }
          }
        }
      }
    }

    current.setUTCDate(current.getUTCDate() + 1);
    loops++;
  }

  return { createdCount, existingCount };
};

module.exports = {
  ensureSessionsForClass
};
