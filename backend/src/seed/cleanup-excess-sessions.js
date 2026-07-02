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
    let totalKept = 0;

    for (const cls of classes) {
      const targetTotal = cls.totalSessions || 24;
      
      const sessions = await Session.find({ classId: cls._id }).sort({ sessionDate: 1 });
      
      if (sessions.length > targetTotal) {
        console.log(`Class ${cls.name} (${cls._id}) has ${sessions.length} sessions (target: ${targetTotal}). Excess: ${sessions.length - targetTotal}`);
        
        const excessSessions = sessions.slice(targetTotal);
        
        for (const session of excessSessions) {
          // Check if this session has any attendance records
          const attendanceCount = await Attendance.countDocuments({ sessionId: session._id });
          
          if (attendanceCount > 0) {
            console.log(`  -> Keeping session ${session._id} (${session.sessionDate}) because it has ${attendanceCount} attendance records.`);
            totalKept++;
          } else {
            console.log(`  -> Deleting excess session ${session._id} (${session.sessionDate}) (no attendance).`);
            await Session.findByIdAndDelete(session._id);
            totalDeleted++;
          }
        }
      }
    }

    console.log('\n=============================================');
    console.log('Cleanup excess sessions completed.');
    console.log(`Total excess sessions deleted: ${totalDeleted}`);
    console.log(`Total excess sessions kept (due to existing attendance): ${totalKept}`);
    console.log('=============================================\n');
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
    process.exit(1);
  }
};

cleanupExcessSessions();
