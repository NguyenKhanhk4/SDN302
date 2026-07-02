const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const Class = require('../../models/Class');
const { ensureSessionsForClass } = require('../../modules/teacher/session-generation.service');

// Pre-load mongoose models
require('../../models/Schedule');
require('../../models/Session');
require('../../models/TeacherProfile');
require('../../models/Subject');

const generateFixedSessions = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected.');

    const classes = await Class.find({ status: { $in: ['scheduled', 'ongoing', 'completed'] } });
    console.log(`Found ${classes.length} active/completed classes.`);

    let totalCreated = 0;
    let totalExisting = 0;

    for (const cls of classes) {
      if (cls.teacherId) {
        console.log(`Generating sessions for Class: ${cls.name} (${cls._id})`);
        const result = await ensureSessionsForClass(cls._id, cls.teacherId);
        console.log(`  -> Created: ${result.createdCount}, Existing: ${result.existingCount}`);
        totalCreated += result.createdCount;
        totalExisting += result.existingCount;
      } else {
        console.log(`Class: ${cls.name} has no teacherId assigned, skipping.`);
      }
    }

    console.log('\n=============================================');
    console.log('Generate sessions fixed data completed.');
    console.log(`Total sessions created: ${totalCreated}`);
    console.log(`Total sessions existing: ${totalExisting}`);
    console.log('=============================================\n');
    process.exit(0);
  } catch (error) {
    console.error('Error generating sessions:', error);
    process.exit(1);
  }
};

generateFixedSessions();
