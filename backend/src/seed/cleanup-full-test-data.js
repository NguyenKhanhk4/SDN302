/**
 * Cleanup script: Xóa toàn bộ dữ liệu test FULL_TEST_DATA_V1
 * Chạy lệnh: npm run cleanup:full-test-data
 *
 * Chỉ xóa dữ liệu test theo danh sách email cố định.
 * KHÔNG xóa toàn bộ database. KHÔNG ảnh hưởng dữ liệu thật.
 */

require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');

const User = require('../models/User');
const TeacherProfile = require('../models/TeacherProfile');
const StudentProfile = require('../models/StudentProfile');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const ClassStudent = require('../models/ClassStudent');
const Schedule = require('../models/Schedule');
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');

let ParentProfile, ParentStudent, Invoice;
try { ParentProfile = require('../models/ParentProfile'); } catch (e) {}
try { ParentStudent = require('../models/ParentStudent'); } catch (e) {}
try { Invoice = require('../models/Invoice'); } catch (e) {}

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sdn302_db';

// Build danh sách email test cố định
function buildTestEmails() {
  const emails = [
    'admin@gmail.com',
    'manager@gmail.com',
    'teacher@gmail.com',
    'teacher2@gmail.com',
  ];
  for (let i = 1; i <= 86; i++) {
    emails.push(`student${String(i).padStart(3, '0')}@gmail.com`);
  }
  for (let i = 1; i <= 50; i++) {
    emails.push(`parent${String(i).padStart(3, '0')}@gmail.com`);
  }
  return emails;
}

const TEST_SUBJECT_NAMES = [
  'Toán 10 Nâng Cao',
  'Vật Lý 11',
  'Tiếng Anh 9',
  'Hóa Học 12',
  'Toán 9 Luyện Thi',
];

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✔ MongoDB connected');

    const testEmails = buildTestEmails();
    console.log(`\nTìm Users test theo ${testEmails.length} email...\n`);

    // 1. Tìm tất cả User test
    const testUsers = await User.find({ email: { $in: testEmails } });
    const testUserIds = testUsers.map(u => u._id);

    if (testUserIds.length === 0) {
      console.log('Không tìm thấy dữ liệu test nào. Database sạch.');
      await mongoose.disconnect();
      process.exit(0);
      return;
    }

    console.log(`Tìm thấy ${testUserIds.length} User test. Bắt đầu cleanup...\n`);

    // 2. Tìm Profile IDs
    const teacherProfiles = await TeacherProfile.find({ userId: { $in: testUserIds } });
    const teacherProfileIds = teacherProfiles.map(t => t._id);

    const studentProfiles = await StudentProfile.find({ userId: { $in: testUserIds } });
    const studentProfileIds = studentProfiles.map(s => s._id);

    let parentProfileIds = [];
    if (ParentProfile) {
      const parentProfiles = await ParentProfile.find({ userId: { $in: testUserIds } });
      parentProfileIds = parentProfiles.map(p => p._id);
    }

    // 3. Tìm Class test (thuộc teacher test)
    const testClasses = await Class.find({ teacherId: { $in: teacherProfileIds } });
    const testClassIds = testClasses.map(c => c._id);

    // 4. Tìm Session test
    const testSessions = await Session.find({ classId: { $in: testClassIds } });
    const testSessionIds = testSessions.map(s => s._id);

    // ============ XÓA THEO THỨ TỰ AN TOÀN ============

    // (1) Attendance
    let delCount = 0;
    if (testSessionIds.length > 0) {
      const res = await Attendance.deleteMany({ sessionId: { $in: testSessionIds } });
      delCount = res.deletedCount;
    }
    console.log(`  1. Attendance:    ${delCount} deleted`);

    // (2) Session
    delCount = 0;
    if (testClassIds.length > 0) {
      const res = await Session.deleteMany({ classId: { $in: testClassIds } });
      delCount = res.deletedCount;
    }
    console.log(`  2. Session:       ${delCount} deleted`);

    // (3) Invoice
    delCount = 0;
    if (Invoice && testClassIds.length > 0) {
      const res = await Invoice.deleteMany({ classId: { $in: testClassIds } });
      delCount = res.deletedCount;
    }
    console.log(`  3. Invoice:       ${delCount} deleted`);

    // (4) Schedule
    delCount = 0;
    if (testClassIds.length > 0) {
      const res = await Schedule.deleteMany({ classId: { $in: testClassIds } });
      delCount = res.deletedCount;
    }
    console.log(`  4. Schedule:      ${delCount} deleted`);

    // (5) ParentStudent
    delCount = 0;
    if (ParentStudent && studentProfileIds.length > 0) {
      const res = await ParentStudent.deleteMany({ studentId: { $in: studentProfileIds } });
      delCount = res.deletedCount;
    }
    console.log(`  5. ParentStudent: ${delCount} deleted`);

    // (6) ClassStudent
    delCount = 0;
    if (testClassIds.length > 0) {
      const res = await ClassStudent.deleteMany({ classId: { $in: testClassIds } });
      delCount = res.deletedCount;
    }
    console.log(`  6. ClassStudent:  ${delCount} deleted`);

    // (7) Class
    delCount = 0;
    if (testClassIds.length > 0) {
      const res = await Class.deleteMany({ _id: { $in: testClassIds } });
      delCount = res.deletedCount;
    }
    console.log(`  7. Class:         ${delCount} deleted`);

    // (8) Subject
    const resSub = await Subject.deleteMany({ name: { $in: TEST_SUBJECT_NAMES } });
    console.log(`  8. Subject:       ${resSub.deletedCount} deleted`);

    // (9) TeacherProfile
    const resTP = await TeacherProfile.deleteMany({ userId: { $in: testUserIds } });
    console.log(`  9. TeacherProfile: ${resTP.deletedCount} deleted`);

    // (10) StudentProfile
    const resSP = await StudentProfile.deleteMany({ userId: { $in: testUserIds } });
    console.log(`  10. StudentProfile: ${resSP.deletedCount} deleted`);

    // (11) ParentProfile
    delCount = 0;
    if (ParentProfile && parentProfileIds.length > 0) {
      const res = await ParentProfile.deleteMany({ _id: { $in: parentProfileIds } });
      delCount = res.deletedCount;
    }
    console.log(`  11. ParentProfile: ${delCount} deleted`);

    // (12) User
    const resUser = await User.deleteMany({ email: { $in: testEmails } });
    console.log(`  12. User:          ${resUser.deletedCount} deleted`);

    console.log('\n✅ Cleanup hoàn tất! Database đã sạch dữ liệu test.');
    console.log('👉 Chạy "npm run seed:full-test" để tạo lại dữ liệu mới.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup thất bại:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

run();
