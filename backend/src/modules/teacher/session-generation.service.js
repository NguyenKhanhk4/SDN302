const Class = require('../../models/Class');
const Schedule = require('../../models/Schedule');
const Session = require('../../models/Session');
const Attendance = require('../../models/Attendance');

const STANDARD_TOTAL_SESSIONS = 30;

const ensureSessionsForClass = async (classId, teacherId) => {
  const cls = await Class.findById(classId);
  if (!cls) return { createdCount: 0, existingCount: 0 };

  if (cls.teacherId.toString() !== teacherId.toString()) {
    return { createdCount: 0, existingCount: 0 };
  }

  if (!cls.startDate) {
    return { createdCount: 0, existingCount: 0 };
  }

  const classStartDate = new Date(cls.startDate);
  classStartDate.setUTCHours(0, 0, 0, 0);
  const sessionsBeforeStart = await Session.find({
    classId,
    sessionDate: { $lt: classStartDate },
  }).select('_id');

  if (sessionsBeforeStart.length > 0) {
    const sessionIds = sessionsBeforeStart.map((session) => session._id);
    await Attendance.deleteMany({ sessionId: { $in: sessionIds } });
    await Session.deleteMany({ _id: { $in: sessionIds } });
  }

  const targetTotal = STANDARD_TOTAL_SESSIONS;
  if (cls.totalSessions !== targetTotal) {
    cls.totalSessions = targetTotal;
    await cls.save();
  }

  const schedules = await Schedule.find({
    classId,
    teacherId,
    status: 'active'
  });

  if (schedules.length === 0) {
    return { createdCount: 0, existingCount: 0 };
  }
  let createdCount = 0;
  let generatedOrFoundCount = await Session.countDocuments({ classId });
  let existingCount = generatedOrFoundCount;

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
    let dayIndex;
    if (dayMap[sch.dayOfWeek] !== undefined) {
      dayIndex = dayMap[sch.dayOfWeek];
    } else if (!isNaN(sch.dayOfWeek)) {
      dayIndex = Number(sch.dayOfWeek);
    }
    
    if (dayIndex !== undefined) {
      if (!schedulesByDay[dayIndex]) schedulesByDay[dayIndex] = [];
      schedulesByDay[dayIndex].push(sch);
    }
  });

  const current = new Date(classStartDate);
  current.setUTCHours(0, 0, 0, 0);

  const maxLoops = 365 * 2;
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
          continue;
        } else {
          try {
            const startStr = schedule.startTime || '00:00';
            const endStr = schedule.endTime || '00:00';
            const [sH, sM] = startStr.split(':').map(Number);
            const [eH, eM] = endStr.split(':').map(Number);
            
            const startDateTime = new Date(sessionDate);
            startDateTime.setUTCHours(sH, sM, 0, 0);

            const endDateTime = new Date(sessionDate);
            endDateTime.setUTCHours(eH, eM, 0, 0);

            await Session.create({
              classId,
              scheduleId: schedule._id,
              sessionDate,
              topic: `Buổi học ngày ${d}/${m}/${y}`,
              status: 'SCHEDULED',
              teacherId: teacherId,
              room: schedule.room || 'Chưa xếp',
              startTime: startDateTime,
              endTime: endDateTime
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

  const allSessions = await Session.find({ classId }).sort({ sessionDate: 1, createdAt: 1 });
  const excessSessions = allSessions.slice(targetTotal);

  if (excessSessions.length > 0) {
    const excessSessionIds = excessSessions.map((session) => session._id);
    await Attendance.deleteMany({ sessionId: { $in: excessSessionIds } });
    await Session.deleteMany({ _id: { $in: excessSessionIds } });
  }

  const generatedSessions = allSessions.slice(0, targetTotal);
  const firstSession = generatedSessions[0];
  const lastSession = generatedSessions[generatedSessions.length - 1];

  if (firstSession && lastSession) {
    const startChanged = !cls.startDate || cls.startDate.getTime() !== firstSession.sessionDate.getTime();
    const endChanged = !cls.endDate || cls.endDate.getTime() !== lastSession.sessionDate.getTime();

    if (startChanged) cls.startDate = firstSession.sessionDate;
    if (endChanged) cls.endDate = lastSession.sessionDate;
    if (startChanged || endChanged) {
      await cls.save();
    }
  }

  return { createdCount, existingCount, endDate: cls.endDate };
};

module.exports = {
  ensureSessionsForClass
};
