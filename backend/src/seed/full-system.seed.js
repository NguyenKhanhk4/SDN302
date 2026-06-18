/**
 * Seed script: Tạo lại toàn bộ dữ liệu test chuẩn cho hệ thống (Admin, Manager, Teacher, Student, Classes...)
 * Chạy lệnh: npm run seed:full
 */

require('dotenv').config({ path: '../../.env' });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const TeacherProfile = require('../models/TeacherProfile');
const StudentProfile = require('../models/StudentProfile');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const ClassStudent = require('../models/ClassStudent');
const Schedule = require('../models/Schedule');
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sdn302_db';

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');

    // 1. Cleanup cũ (Dựa trên pattern '_test')
    console.log('Đang dọn dẹp dữ liệu test cũ...');
    const oldTestUsers = await User.find({ email: /_test/ });
    const oldUserIds = oldTestUsers.map(u => u._id);

    // Xóa Profile
    await TeacherProfile.deleteMany({ userId: { $in: oldUserIds } });
    await StudentProfile.deleteMany({ userId: { $in: oldUserIds } });

    // Xóa Subject test
    await Subject.deleteMany({ name: /Test Subject/ });

    // Xóa Class test
    const oldClasses = await Class.find({ name: /Test Class/ });
    const oldClassIds = oldClasses.map(c => c._id);
    await Class.deleteMany({ _id: { $in: oldClassIds } });
    await ClassStudent.deleteMany({ classId: { $in: oldClassIds } });

    // Xóa Schedule, Session, Attendance test
    await Schedule.deleteMany({ classId: { $in: oldClassIds } });
    
    const oldSessions = await Session.find({ classId: { $in: oldClassIds } });
    const oldSessionIds = oldSessions.map(s => s._id);
    
    await Session.deleteMany({ classId: { $in: oldClassIds } });
    await Attendance.deleteMany({ sessionId: { $in: oldSessionIds } });

    // Xóa User
    await User.deleteMany({ _id: { $in: oldUserIds } });
    console.log('Đã dọn dẹp xong dữ liệu test cũ.');

    // 2. Đọc JSON file
    const dataPath = path.join(__dirname, 'test-data.json');
    if (!fs.existsSync(dataPath)) {
      throw new Error("Không tìm thấy file test-data.json. Hãy chạy node src/seed/generate-json.js trước.");
    }
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    // 3. Hash password chung "123456" cho tất cả User test
    console.log('Đang băm mật khẩu...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    data.users.forEach(u => {
      u.password = hashedPassword;
    });

    // 4. Insert DB
    console.log('Đang insert dữ liệu mới...');
    
    // Bỏ qua hook pre-save để giữ password đã hash (vì nếu dùng create sẽ bị hash lại)
    await User.insertMany(data.users);
    console.log(`- Inserted ${data.users.length} Users.`);

    await TeacherProfile.insertMany(data.teacherProfiles);
    console.log(`- Inserted ${data.teacherProfiles.length} Teacher Profiles.`);

    await StudentProfile.insertMany(data.studentProfiles);
    console.log(`- Inserted ${data.studentProfiles.length} Student Profiles.`);

    await Subject.insertMany(data.subjects);
    console.log(`- Inserted ${data.subjects.length} Subjects.`);

    await Class.insertMany(data.classes);
    console.log(`- Inserted ${data.classes.length} Classes.`);

    await ClassStudent.insertMany(data.classStudents);
    console.log(`- Inserted ${data.classStudents.length} ClassStudents (Enrolled).`);

    await Schedule.insertMany(data.schedules);
    console.log(`- Inserted ${data.schedules.length} Schedules (5 Ca Học).`);

    await Session.insertMany(data.sessions);
    console.log(`- Inserted ${data.sessions.length} Sessions mẫu.`);

    await Attendance.insertMany(data.attendances);
    console.log(`- Inserted ${data.attendances.length} Attendances mẫu.`);

    console.log('\n✅ Tạo toàn bộ dữ liệu test thành công!');
    console.log('Tài khoản test:');
    console.log('  Admin: admin_test@gmail.com / 123456');
    console.log('  Manager: manager_test@gmail.com / 123456');
    console.log('  Teacher 1: teacher_test1@gmail.com / 123456');
    console.log('  Teacher 2: teacher_test2@gmail.com / 123456');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi chạy script:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

run();
