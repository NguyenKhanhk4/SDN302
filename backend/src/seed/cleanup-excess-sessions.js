const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const Class = require('../models/Class');
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');

const cleanupExcessSessions = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected.');

    const classes = await Class.find({});
    console.log(`Found ${classes.length} total classes. Checking for excess sessions...`);

    let totalDeleted = 0;
    let totalAttendanceDeleted = 0;

    for (const cls of classes) {
      const targetTotal = 30;
      
      let sessions = await Session.find({ classId: cls._id }).sort({ sessionDate: 1 });
      const classStartDate = cls.startDate ? new Date(cls.startDate) : null;

      if (classStartDate) {
        const sessionsBeforeStart = sessions.filter((session) => session.sessionDate < classStartDate);
        if (sessionsBeforeStart.length > 0) {
          const beforeStartIds = sessionsBeforeStart.map((session) => session._id);
          await Attendance.deleteMany({ sessionId: { $in: beforeStartIds } });
          await Session.deleteMany({ _id: { $in: beforeStartIds } });
          sessions = sessions.filter((session) => session.sessionDate >= classStartDate);
        }
      }

      cls.totalSessions = targetTotal;
      if (sessions.length > 0) cls.startDate = sessions[0].sessionDate;
      if (sessions.length >= targetTotal) {
        cls.endDate = sessions[targetTotal - 1].sessionDate;
      }
      await cls.save();
      
      if (sessions.length > targetTotal) {
        console.log(`Class ${cls.name} (${cls._id}) has ${sessions.length} sessions (target: ${targetTotal}). Excess: ${sessions.length - targetTotal}`);
        
        const excessSessions = sessions.slice(targetTotal);
        
        for (const session of excessSessions) {
          const attendanceResult = await Attendance.deleteMany({ sessionId: session._id });
          await Session.findByIdAndDelete(session._id);
          totalDeleted++;
          totalAttendanceDeleted += attendanceResult.deletedCount;
        }
      }
    }

    console.log('\n=============================================');
    console.log('Cleanup excess sessions completed.');
    console.log(`Total excess sessions deleted: ${totalDeleted}`);
    console.log(`Attendance records removed with excess sessions: ${totalAttendanceDeleted}`);
    console.log('=============================================\n');
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
    process.exit(1);
  }
};

cleanupExcessSessions();
