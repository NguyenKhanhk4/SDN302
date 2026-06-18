/**
 * Seed script: Xóa dữ liệu Schedule, Session, Attendance cũ để test với khung giờ mới.
 *
 * Chạy lệnh: node src/seed/cleanup-schedules.seed.js
 */

require('dotenv').config({ path: '../../.env' });

const mongoose = require('mongoose');

const Schedule = require('../models/Schedule');
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sdn302_db';

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');

    console.log('Đang xóa dữ liệu Attendance...');
    await Attendance.deleteMany({});
    
    console.log('Đang xóa dữ liệu Session...');
    await Session.deleteMany({});
    
    console.log('Đang xóa dữ liệu Schedule...');
    await Schedule.deleteMany({});

    console.log('✅ Đã xóa toàn bộ Schedule, Session và Attendance cũ.');
    console.log('👉 Hãy chạy lại: npm run seed:teacher-basic để tạo dữ liệu mới với đúng khung giờ.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi xóa dữ liệu:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

run();
