require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');

const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Class = require('../models/Class');
const ClassStudent = require('../models/ClassStudent');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sdn302_db';

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');

    const students = [
      {
        name: 'Le Van Student2',
        email: 'student2@gmail.com',
        grade: '10',
        school: 'THPT Le Hong Phong',
        parentName: 'Le Van Bo',
        parentPhone: '0923456789',
      },
      {
        name: 'Pham Thi Student3',
        email: 'student3@gmail.com',
        grade: '11',
        school: 'THPT Tran Phu',
        parentName: 'Pham Van Bo',
        parentPhone: '0934567890',
      },
    ];

    // Lay class de enroll students vao
    const classroom = await Class.findOne({ name: 'Lop Toan 10A' });
    if (!classroom) {
      console.log('Khong tim thay class "Lop Toan 10A". Hay chay seed chinh truoc.');
      process.exit(1);
    }

    for (const s of students) {
      // Tao User neu chua co
      let user = await User.findOne({ email: s.email });
      if (!user) {
        user = await User.create({
          name: s.name,
          email: s.email,
          password: '123456',
          role: 'student',
        });
        console.log(`Created User STUDENT: ${user.email}`);
      } else {
        console.log(`User da ton tai: ${user.email}`);
      }

      // Tao StudentProfile neu chua co
      let profile = await StudentProfile.findOne({ userId: user._id });
      if (!profile) {
        profile = await StudentProfile.create({
          userId: user._id,
          grade: s.grade,
          school: s.school,
          parentName: s.parentName,
          parentPhone: s.parentPhone,
        });
        console.log(`Created StudentProfile for: ${user.email}`);
      } else {
        console.log(`StudentProfile da ton tai: ${user.email}`);
      }

      // Enroll vao class neu chua co
      const existing = await ClassStudent.findOne({
        classId: classroom._id,
        studentId: profile._id,
      });
      if (!existing) {
        await ClassStudent.create({
          classId: classroom._id,
          studentId: profile._id,
          status: 'enrolled',
        });
        console.log(`Enrolled ${user.email} vao lop ${classroom.name}`);
      } else {
        console.log(`${user.email} da enrolled roi`);
      }
    }

    console.log('\n✅ Them 2 hoc sinh thanh cong!');
    console.log('   student2@gmail.com / 123456');
    console.log('   student3@gmail.com / 123456');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Loi:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

run();
