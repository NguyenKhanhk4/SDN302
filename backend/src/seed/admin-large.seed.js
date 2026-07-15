/**
 * Seed script: Tao luong du lieu lon de test Admin Frontend va Backend
 *
 * Chay lenh: node src/seed/admin-large.seed.js
 */

require('dotenv').config({ path: '../../.env' });

const mongoose = require('mongoose');

// Models
const User = require('../models/User');
const TeacherProfile = require('../models/TeacherProfile');
const StudentProfile = require('../models/StudentProfile');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const ClassStudent = require('../models/ClassStudent');
const Schedule = require('../models/Schedule');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sdn302_db';

const runLargeSeed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully for LARGE SEED');

    // 1. Clear existing data to start fresh
    console.log('Cleaning collections...');
    await User.deleteMany({});
    await TeacherProfile.deleteMany({});
    await StudentProfile.deleteMany({});
    await Subject.deleteMany({});
    await Class.deleteMany({});
    await ClassStudent.deleteMany({});
    await Schedule.deleteMany({});
    console.log('Collections cleared.');

    // 2. Create Admin & Managers
    console.log('Creating Admin & Managers...');
    await User.create({
      name: 'Nguyen Van Admin',
      email: 'admin@gmail.com',
      password: 'adminpassword',
      role: 'admin',
      isActive: true
    });

    const managers = [];
    for (let i = 1; i <= 3; i++) {
      const manager = await User.create({
        name: `Quan Ly ${i}`,
        email: `manager${i}@gmail.com`,
        password: '123456',
        role: 'manager',
        isActive: true
      });
      managers.push(manager);
    }
    console.log(`Created 1 Admin and ${managers.length} Managers.`);

    // 3. Create Parents
    console.log('Creating Parents...');
    const parents = [];
    for (let i = 1; i <= 5; i++) {
      const parent = await User.create({
        name: `Phu Huynh ${i}`,
        email: `parent${i}@gmail.com`,
        password: '123456',
        role: 'parent',
        isActive: true
      });
      parents.push(parent);
    }
    console.log(`Created ${parents.length} Parents.`);

    // 4. Create Teachers & TeacherProfiles
    console.log('Creating Teachers & Profiles...');
    const teacherSpecs = [
      ['Toan', 'Tin hoc'],
      ['Vat ly', 'Hoa hoc'],
      ['Tieng Anh', 'Giao tiep'],
      ['Ngu van', 'Lich su'],
      ['Sinh hoc', 'Hoa hoc']
    ];
    const teachers = [];
    const teacherProfiles = [];

    for (let i = 1; i <= 6; i++) {
      const teacherUser = await User.create({
        name: `Giao Vien ${i}`,
        email: `teacher${i}@gmail.com`,
        password: '123456',
        role: 'teacher',
        isActive: i !== 6 // Giao Vien 6 se bi inactive de test
      });
      teachers.push(teacherUser);

      const profile = await TeacherProfile.create({
        userId: teacherUser._id,
        specialization: teacherSpecs[(i - 1) % teacherSpecs.length],
        experienceYears: 2 + i,
        bio: `Giao vien giang day mon chuyen mon ${i} voi nhieu nam kinh nghiem.`,
        phoneNumber: `090812345${i}`
      });
      teacherProfiles.push(profile);
    }
    console.log(`Created ${teachers.length} Teachers and Profiles.`);

    // 5. Create Students & StudentProfiles
    console.log('Creating Students & Profiles...');
    const students = [];
    const studentProfiles = [];
    const schools = ['THPT Nguyen Trai', 'THPT Tran Phu', 'THCS Le Quy Don', 'THPT Le Hong Phong'];

    for (let i = 1; i <= 25; i++) {
      const studentUser = await User.create({
        name: `Hoc Sinh ${i}`,
        email: `student${i}@gmail.com`,
        password: '123456',
        role: 'student',
        isActive: i !== 25 // Hoc sinh 25 bi banned/inactive
      });
      students.push(studentUser);

      const profile = await StudentProfile.create({
        userId: studentUser._id,
        parentName: `Phu Huynh Hoc Sinh ${i}`,
        parentPhone: `09151234${i.toString().padStart(2, '0')}`,
        grade: String(9 + (i % 4)), // Grades 9, 10, 11, 12
        school: schools[i % schools.length]
      });
      studentProfiles.push(profile);
    }
    console.log(`Created ${students.length} Students and Profiles.`);

    // 6. Create Subjects
    console.log('Creating Subjects...');
    const subjectList = [
      { name: 'Toan Dai So 10', description: 'Toan dai so lop 10', gradeLevel: 'Lop 10', fee: 500000 },
      { name: 'Toan Hinh Hoc 11', description: 'Toan hinh hoc lop 11', gradeLevel: 'Lop 11', fee: 600000 },
      { name: 'Vat Ly Dai Cuong', description: 'Ly thuyet va bai tap Vat ly', gradeLevel: 'Lop 12', fee: 550000 },
      { name: 'Hoa Hoc Huu Co', description: 'Hoa hoc lop 12 chuyen sau', gradeLevel: 'Lop 12', fee: 700000 },
      { name: 'Tieng Anh IELTS', description: 'Luyen thi chung chi IELTS', gradeLevel: 'All', fee: 1000000 },
      { name: 'Ngu Van Can Ban', description: 'Van hoc va tap lam van', gradeLevel: 'Lop 9', fee: 400000 }
    ];
    const subjects = [];
    for (const sub of subjectList) {
      const subject = await Subject.create({
        name: sub.name,
        description: sub.description,
        gradeLevel: sub.gradeLevel,
        defaultTuitionFee: sub.fee,
        status: 'active'
      });
      subjects.push(subject);
    }
    console.log(`Created ${subjects.length} Subjects.`);

    // 7. Create Classes
    console.log('Creating Classes...');
    const classList = [
      { name: 'Lop Toan A1', subjectIdx: 0, teacherIdx: 0, room: 'Phong B201', status: 'ongoing' },
      { name: 'Lop Toan A2', subjectIdx: 1, teacherIdx: 0, room: 'Phong B202', status: 'ongoing' },
      { name: 'Lop Ly L1', subjectIdx: 2, teacherIdx: 1, room: 'Phong A102', status: 'ongoing' },
      { name: 'Lop Hoa H1', subjectIdx: 3, teacherIdx: 4, room: 'Phong A103', status: 'ongoing' },
      { name: 'Lop Anh E1', subjectIdx: 4, teacherIdx: 2, room: 'Phong Online 1', status: 'ongoing' },
      { name: 'Lop Anh E2', subjectIdx: 4, teacherIdx: 2, room: 'Phong Online 2', status: 'scheduled' },
      { name: 'Lop Van V1', subjectIdx: 5, teacherIdx: 3, room: 'Phong C101', status: 'completed' },
      { name: 'Lop Toan A3', subjectIdx: 0, teacherIdx: 5, room: 'Phong B203', status: 'cancelled' }
    ];

    const classes = [];
    for (const c of classList) {
      const classroom = await Class.create({
        name: c.name,
        subjectId: subjects[c.subjectIdx]._id,
        teacherId: teacherProfiles[c.teacherIdx]._id,
        room: c.room,
        maxStudents: 15,
        totalSessions: 30,
        startDate: new Date('2026-09-01'),
        endDate: new Date('2027-05-31'),
        status: c.status
      });
      classes.push(classroom);
    }
    console.log(`Created ${classes.length} Classes.`);

    // 8. Enroll Students into Classes (ClassStudent)
    console.log('Enrolling Students...');
    // Enroll random students in each class
    for (let cIdx = 0; cIdx < classes.length; cIdx++) {
      const cls = classes[cIdx];
      // Skip completed or cancelled classes from having active students, or just enroll them anyway
      const numStudentsToEnroll = 4 + (cIdx % 6); // 4 to 9 students
      const enrolledStudentIndexes = new Set();
      
      while (enrolledStudentIndexes.size < numStudentsToEnroll) {
        enrolledStudentIndexes.add(Math.floor(Math.random() * studentProfiles.length));
      }

      for (const sIdx of enrolledStudentIndexes) {
        await ClassStudent.create({
          classId: cls._id,
          studentId: studentProfiles[sIdx]._id,
          status: cls.status === 'completed' ? 'completed' : 'enrolled'
        });
      }
    }
    console.log('Students enrolled successfully.');

    // 9. Create Schedules
    console.log('Creating Schedules...');
    // Create 1-2 schedule slots for each active class
    const timeSlots = [
      { start: '08:00', end: '10:00' },
      { start: '10:00', end: '12:00' },
      { start: '14:00', end: '16:00' },
      { start: '16:00', end: '18:00' },
      { start: '19:00', end: '21:00' }
    ];

    // Schedules for class 0 (Lop Toan A1)
    await Schedule.create({
      classId: classes[0]._id,
      teacherId: classes[0].teacherId,
      dayOfWeek: '1', // Monday
      startTime: timeSlots[0].start,
      endTime: timeSlots[0].end,
      room: classes[0].room,
      status: 'active'
    });
    await Schedule.create({
      classId: classes[0]._id,
      teacherId: classes[0].teacherId,
      dayOfWeek: '3', // Wednesday
      startTime: timeSlots[0].start,
      endTime: timeSlots[0].end,
      room: classes[0].room,
      status: 'active'
    });

    // Schedules for class 1 (Lop Toan A2)
    await Schedule.create({
      classId: classes[1]._id,
      teacherId: classes[1].teacherId,
      dayOfWeek: '2', // Tuesday
      startTime: timeSlots[1].start,
      endTime: timeSlots[1].end,
      room: classes[1].room,
      status: 'active'
    });

    // Schedules for class 2 (Lop Ly L1)
    await Schedule.create({
      classId: classes[2]._id,
      teacherId: classes[2].teacherId,
      dayOfWeek: '1', // Monday
      startTime: timeSlots[2].start,
      endTime: timeSlots[2].end,
      room: classes[2].room,
      status: 'active'
    });
    await Schedule.create({
      classId: classes[2]._id,
      teacherId: classes[2].teacherId,
      dayOfWeek: '4', // Thursday
      startTime: timeSlots[2].start,
      endTime: timeSlots[2].end,
      room: classes[2].room,
      status: 'active'
    });

    // Schedules for class 3 (Lop Hoa H1)
    await Schedule.create({
      classId: classes[3]._id,
      teacherId: classes[3].teacherId,
      dayOfWeek: '5', // Friday
      startTime: timeSlots[3].start,
      endTime: timeSlots[3].end,
      room: classes[3].room,
      status: 'active'
    });

    // Schedules for class 4 (Lop Anh E1)
    await Schedule.create({
      classId: classes[4]._id,
      teacherId: classes[4].teacherId,
      dayOfWeek: '6', // Saturday
      startTime: timeSlots[4].start,
      endTime: timeSlots[4].end,
      room: classes[4].room,
      status: 'active'
    });

    // Schedules for class 5 (Lop Anh E2)
    await Schedule.create({
      classId: classes[5]._id,
      teacherId: classes[5].teacherId,
      dayOfWeek: '0', // Sunday
      startTime: timeSlots[0].start,
      endTime: timeSlots[0].end,
      room: classes[5].room,
      status: 'active'
    });

    // Schedules for class 6 (Lop Van V1 - Completed)
    await Schedule.create({
      classId: classes[6]._id,
      teacherId: classes[6].teacherId,
      dayOfWeek: '3', // Wednesday
      startTime: timeSlots[2].start,
      endTime: timeSlots[2].end,
      room: classes[6].room,
      status: 'active'
    });

    // Schedules for class 7 (Lop Toan A3 - Cancelled)
    await Schedule.create({
      classId: classes[7]._id,
      teacherId: classes[7].teacherId,
      dayOfWeek: '4', // Thursday
      startTime: timeSlots[1].start,
      endTime: timeSlots[1].end,
      room: classes[7].room,
      status: 'cancelled'
    });

    console.log('Schedules created successfully.');

    console.log('\n========================================');
    console.log('✅ LARGE SEED COMPLETED SUCCESSFULLY!');
    console.log('Summary of created test data:');
    console.log(`   - Users: ${await User.countDocuments()}`);
    console.log(`     * Admin: 1 (admin@gmail.com / adminpassword)`);
    console.log(`     * Managers: 3 (manager1@gmail.com / 123456)`);
    console.log(`     * Teachers: 6 (teacher1@gmail.com / 123456)`);
    console.log(`     * Students: 25 (student1@gmail.com / 123456)`);
    console.log(`     * Parents: 5 (parent1@gmail.com / 123456)`);
    console.log(`   - Subjects: ${await Subject.countDocuments()}`);
    console.log(`   - Classes: ${await Class.countDocuments()}`);
    console.log(`   - Class Enrollments: ${await ClassStudent.countDocuments()}`);
    console.log(`   - Schedules: ${await Schedule.countDocuments()}`);
    console.log('========================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Large seed failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

runLargeSeed();
