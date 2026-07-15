require('dotenv').config({ path: '../../.env' });

const mongoose = require('mongoose');

const User = require('../../models/User');
const TeacherProfile = require('../../models/TeacherProfile');
const StudentProfile = require('../../models/StudentProfile');
const Subject = require('../../models/Subject');
const Class = require('../../models/Class');
const ClassStudent = require('../../models/ClassStudent');
const Schedule = require('../../models/Schedule');

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sdn302_db';

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');

    let teacherUser = await User.findOne({ email: 'teacher@gmail.com' });
    if (!teacherUser) {
      teacherUser = await User.create({
        name: 'Nguyen Van Teacher',
        email: 'teacher@gmail.com',
        password: '123456',
        role: 'teacher',
      });
      console.log('Created User TEACHER:', teacherUser.email);
    } else {
      console.log('User TEACHER da ton tai:', teacherUser.email);
    }

    let teacherProfile = await TeacherProfile.findOne({ userId: teacherUser._id });
    if (!teacherProfile) {
      teacherProfile = await TeacherProfile.create({
        userId: teacherUser._id,
        specialization: ['Toan', 'Vat ly'],
        experienceYears: 5,
        bio: 'Giao vien co kinh nghiem giang day cac mon Khoa hoc tu nhien',
        phoneNumber: '0901234567',
      });
      console.log('Created TeacherProfile for:', teacherUser.email);
    } else {
      console.log('TeacherProfile da ton tai');
    }

    let studentUser = await User.findOne({ email: 'student@gmail.com' });
    if (!studentUser) {
      studentUser = await User.create({
        name: 'Tran Thi Student',
        email: 'student@gmail.com',
        password: '123456',
        role: 'student',
      });
      console.log('Created User STUDENT:', studentUser.email);
    } else {
      console.log('User STUDENT da ton tai:', studentUser.email);
    }

    let studentProfile = await StudentProfile.findOne({ userId: studentUser._id });
    if (!studentProfile) {
      studentProfile = await StudentProfile.create({
        userId: studentUser._id,
        parentName: 'Tran Van Bo',
        parentPhone: '0912345678',
        grade: '10',
        school: 'THPT Nguyen Trai',
      });
      console.log('Created StudentProfile for:', studentUser.email);
    } else {
      console.log('StudentProfile da ton tai');
    }

    let subject = await Subject.findOne({ name: 'Toan Nang Cao' });
    if (!subject) {
      subject = await Subject.create({
        name: 'Toan Nang Cao',
        description: 'Mon Toan nang cao danh cho hoc sinh THPT',
        gradeLevel: 'THPT',
        defaultTuitionFee: 800000,
        status: 'active',
      });
      console.log('Created Subject:', subject.name);
    } else {
      console.log('Subject da ton tai:', subject.name);
    }

    let classroom = await Class.findOne({
      name: 'Lop Toan 10A',
      teacherId: teacherProfile._id,
    });
    if (!classroom) {
      classroom = await Class.create({
        name: 'Lop Toan 10A',
        subjectId: subject._id,
        teacherId: teacherProfile._id,
        room: 'Phong B201',
        maxStudents: 15,
        totalSessions: 30,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-05-31'),
        status: 'ongoing',
      });
      console.log('Created Class:', classroom.name);
    } else {
      console.log('Class da ton tai:', classroom.name);
    }

    let classStudent = await ClassStudent.findOne({
      classId: classroom._id,
      studentId: studentProfile._id,
    });
    if (!classStudent) {
      classStudent = await ClassStudent.create({
        classId: classroom._id,
        studentId: studentProfile._id,
        status: 'enrolled',
      });
      console.log('Created ClassStudent: student enrolled in class');
    } else {
      console.log('ClassStudent da ton tai');
    }

    let schedule = await Schedule.findOne({
      classId: classroom._id,
      teacherId: teacherProfile._id,
      dayOfWeek: 'Monday',
    });
    if (!schedule) {
      schedule = await Schedule.create({
        classId: classroom._id,
        teacherId: teacherProfile._id,
        dayOfWeek: 'Monday',
        startTime: '07:30',
        endTime: '09:30',
        room: 'Phong B201',
        status: 'active',
      });
      console.log('Created Schedule: Monday 08:00 - 10:00');
    } else {
      console.log('Schedule da ton tai');
    }

    let schedule2 = await Schedule.findOne({
      classId: classroom._id,
      teacherId: teacherProfile._id,
      dayOfWeek: 'Wednesday',
    });
    if (!schedule2) {
      schedule2 = await Schedule.create({
        classId: classroom._id,
        teacherId: teacherProfile._id,
        dayOfWeek: 'Wednesday',
        startTime: '07:30',
        endTime: '09:30',
        room: 'Phong B201',
        status: 'active',
      });
      console.log('Created Schedule: Wednesday 08:00 - 10:00');
    } else {
      console.log('Schedule Wednesday da ton tai');
    }

    console.log('\n✅ Seed hoan thanh! Du lieu de test:');
    console.log('   Teacher login: teacher@gmail.com / 123456');
    console.log('   Student login: student@gmail.com / 123456');
    console.log('   Class: Lop Toan 10A');
    console.log('   Subject: Toan Nang Cao');
    console.log('   Schedules: Monday & Wednesday 07:30-09:30');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed that bai:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

run();
