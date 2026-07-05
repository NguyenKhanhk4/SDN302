const mongoose = require('mongoose');
const User = require('./src/models/User');
const TeacherProfile = require('./src/models/TeacherProfile');
const Subject = require('./src/models/Subject');
const Class = require('./src/models/Class');

async function testPhase2() {
  console.log('--- Starting Phase 2 Test ---');
  await mongoose.connect('mongodb://localhost:27017/sdn302_db');
  console.log('Connected to DB');

  try {
    // 1. Setup Test Data
    const student = await User.findOne({ email: 'alice@example.com' });
    const teacherUser = await User.findOne({ email: 'bob@example.com' });
    const teacherUser2 = await User.findOne({ email: 'teacher2@example.com' }); // We might need a second teacher for substitute

    if (!student || !teacherUser) {
      console.log('Please run the Phase 1 import test first.');
      process.exit(1);
    }

    let teacher2 = teacherUser2;
    if (!teacher2) {
      teacher2 = await User.create({ name: 'Teacher Two', email: 'teacher2@example.com', password: 'password', role: 'teacher' });
    }

    let teacherProfile = await TeacherProfile.findOne({ userId: teacherUser._id });
    if (!teacherProfile) {
      teacherProfile = await TeacherProfile.create({ userId: teacherUser._id, specialization: ['Math'] });
    }

    let teacherProfile2 = await TeacherProfile.findOne({ userId: teacher2._id });
    if (!teacherProfile2) {
      teacherProfile2 = await TeacherProfile.create({ userId: teacher2._id, specialization: ['Math'] });
    }

    let subject = await Subject.findOne({ name: 'Advanced Math' });
    if (!subject) {
      subject = await Subject.create({ name: 'Advanced Math', defaultTuitionFee: 5000000 });
    }

    let classDoc = await Class.findOne({ name: 'Math-101' });
    if (!classDoc) {
      classDoc = await Class.create({
        name: 'Math-101',
        subjectId: subject._id,
        teacherId: teacherProfile._id,
        maxStudents: 1, // Set to 1 to test full capacity
      });
    }

    console.log('Data setup complete.');

    // 2. Test Enrollment Flow (Register -> Pending -> Approve)
    console.log('\n--- Testing Enrollment: Register ---');
    const registerResponse = await fetch('http://localhost:5000/api/enrollment/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: student._id, classId: classDoc._id })
    });
    const registerResult = await registerResponse.json();
    console.log('Register Response:', registerResult);

    if (registerResult.success) {
      const enrollmentId = registerResult.data._id;
      console.log('\n--- Testing Enrollment: Approve ---');
      const approveResponse = await fetch(`http://localhost:5000/api/enrollment/${enrollmentId}/approve`, {
        method: 'PUT'
      });
      console.log('Approve Response:', await approveResponse.json());

      console.log('\n--- Testing Enrollment: Approve when Full (Should fail if maxStudents is reached) ---');
      const student2 = await User.create({ name: 'Another Student', email: 'stu2@example.com', password: 'password', role: 'student' });
      const registerResponse2 = await fetch('http://localhost:5000/api/enrollment/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: student2._id, classId: classDoc._id })
      });
      const regRes2 = await registerResponse2.json();
      if (regRes2.success) {
        const approveResponse2 = await fetch(`http://localhost:5000/api/enrollment/${regRes2.data._id}/approve`, {
          method: 'PUT'
        });
        console.log('Approve 2nd Student Response (Should be full):', await approveResponse2.json());
      }
    }

    // 3. Test Conflict Detection (Create Session)
    console.log('\n--- Testing Conflict Detection: Create Session 1 ---');
    const startTime = new Date();
    startTime.setHours(8, 0, 0, 0); // Today 8:00 AM
    const endTime = new Date();
    endTime.setHours(10, 0, 0, 0); // Today 10:00 AM

    const sessionRes1 = await fetch('http://localhost:5000/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classId: classDoc._id,
        teacherId: teacherProfile._id,
        room: 'Room A',
        startTime,
        endTime,
        sessionDate: startTime
      })
    });
    const s1 = await sessionRes1.json();
    console.log('Session 1 Response:', s1);

    console.log('\n--- Testing Conflict Detection: Create Session 2 (Conflict) ---');
    // Try to create another session at 9:00 AM to 11:00 AM for the same teacher
    const startTime2 = new Date();
    startTime2.setHours(9, 0, 0, 0);
    const endTime2 = new Date();
    endTime2.setHours(11, 0, 0, 0);

    const sessionRes2 = await fetch('http://localhost:5000/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classId: classDoc._id,
        teacherId: teacherProfile._id,
        room: 'Room B', // Different room, but same teacher
        startTime: startTime2,
        endTime: endTime2,
        sessionDate: startTime2
      })
    });
    console.log('Session 2 Response (Should be conflict):', await sessionRes2.json());

    if (s1.success) {
      console.log('\n--- Testing Substitute Teacher ---');
      const subRes = await fetch(`http://localhost:5000/api/session/${s1.data._id}/substitute`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newTeacherId: teacherProfile2._id })
      });
      console.log('Substitute Response:', await subRes.json());
    }

  } catch (err) {
    console.error('Error during testing:', err);
  } finally {
    mongoose.connection.close();
  }
}

testPhase2();
