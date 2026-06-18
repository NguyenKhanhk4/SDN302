/**
 * Seed script: Clean old data and recreate schedules for teacher test
 * Chạy lệnh: npm run seed:teacher-schedule
 */

require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');

const User = require('../models/User');
const TeacherProfile = require('../models/TeacherProfile');
const Class = require('../models/Class');
const Schedule = require('../models/Schedule');
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sdn302_db';

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');

    // 1. Tìm teacher test
    const teacherUser = await User.findOne({ email: 'teacher@gmail.com' });
    if (!teacherUser) {
      throw new Error("Không tìm thấy User teacher@gmail.com. Vui lòng chạy seed:teacher-basic trước.");
    }

    // 2. Tìm TeacherProfile
    const teacherProfile = await TeacherProfile.findOne({ userId: teacherUser._id });
    if (!teacherProfile) {
      throw new Error("Không tìm thấy TeacherProfile của teacher@gmail.com.");
    }

    // 3. Tìm class test hiện có của teacher
    const classroom = await Class.findOne({ teacherId: teacherProfile._id });
    if (!classroom) {
      throw new Error("No class found for teacher. Please run teacher-basic seed first.");
    }

    // 4. Xóa data cũ có liên quan đến class
    console.log(`Đang dọn dẹp dữ liệu cũ cho lớp: ${classroom.name}...`);

    // Lấy tất cả session của class này để xóa attendance
    const sessions = await Session.find({ classId: classroom._id });
    const sessionIds = sessions.map(s => s._id);

    const deletedAttendances = await Attendance.deleteMany({ sessionId: { $in: sessionIds } });
    console.log(`- Đã xóa ${deletedAttendances.deletedCount} bản ghi Attendance.`);

    const deletedSessions = await Session.deleteMany({ classId: classroom._id });
    console.log(`- Đã xóa ${deletedSessions.deletedCount} bản ghi Session.`);

    const deletedSchedules = await Schedule.deleteMany({ classId: classroom._id, teacherId: teacherProfile._id });
    console.log(`- Đã xóa ${deletedSchedules.deletedCount} bản ghi Schedule cũ.`);

    // 5. Tạo lịch mới đúng 5 ca học
    console.log(`Đang tạo lịch mới theo 5 ca học cho lớp ${classroom.name}...`);

    const newSchedulesData = [
      {
        classId: classroom._id,
        teacherId: teacherProfile._id,
        dayOfWeek: 'Monday', // Tương ứng Thứ 2
        startTime: '07:30',
        endTime: '09:30',
        room: 'Phòng B201',
        status: 'active'
      },
      {
        classId: classroom._id,
        teacherId: teacherProfile._id,
        dayOfWeek: 'Wednesday', // Tương ứng Thứ 4
        startTime: '14:00',
        endTime: '16:00',
        room: 'Phòng B201',
        status: 'active'
      },
      {
        classId: classroom._id,
        teacherId: teacherProfile._id,
        dayOfWeek: 'Friday', // Tương ứng Thứ 6
        startTime: '18:00',
        endTime: '20:00',
        room: 'Phòng B201',
        status: 'active'
      }
    ];

    const createdSchedules = await Schedule.insertMany(newSchedulesData);
    console.log(`- Đã tạo thành công ${createdSchedules.length} lịch học mới (Ca 1, Ca 3, Ca 5).`);

    console.log('\n✅ Hoàn tất dọn dẹp và cập nhật lịch cho test teacher!');
    console.log('Bạn có thể refresh lại trang Timetable trên giao diện Frontend để xem kết quả.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi chạy script:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

run();
