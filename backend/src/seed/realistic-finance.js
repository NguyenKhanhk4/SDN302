const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');

// Models
const Class = require('../models/Class');
const StudentProfile = require('../models/StudentProfile');
const TeacherProfile = require('../models/TeacherProfile');
const Enrollment = require('../models/Enrollment');
const Invoice = require('../models/Invoice');
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const Subject = require('../models/Subject');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI_ATLAS || process.env.MONGODB_URI;

const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✔ MongoDB connected');

    // 1. Xóa dữ liệu cũ và drop indexes rác
    console.log('Wiping old Enrollments, Invoices, Sessions, Attendances, Payrolls...');
    await Enrollment.deleteMany({});
    await Invoice.deleteMany({});
    await Session.deleteMany({});
    await Attendance.deleteMany({});
    await Payroll.deleteMany({});

    try {
      await Invoice.collection.dropIndex('studentId_1_classId_1_month_1');
      console.log('Dropped old Invoice index');
    } catch(e) {}

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0-indexed

    // 2. Fetch Data
    const classes = await Class.find().populate('subjectId');
    const students = await StudentProfile.find();
    
    if (!classes.length || !students.length) {
      console.log('No classes or students found. Cannot generate data.');
      process.exit(0);
    }

    console.log(`Found ${classes.length} classes, ${students.length} students.`);

    // 3. Sinh Enrollment & Invoice (Trải dài từ Tháng 1 đến hiện tại)
    let enrollmentCount = 0;
    let invoiceCount = 0;

    for (const cls of classes) {
      // Pick random 15-20 students for this class
      const numStudents = Math.floor(Math.random() * 6) + 15;
      const shuffledStudents = [...students].sort(() => 0.5 - Math.random());
      const selectedStudents = shuffledStudents.slice(0, numStudents);

      for (const sp of selectedStudents) {
        // Random date from Jan 1st to Today
        const startDate = new Date(currentYear, 0, 1);
        const endDate = new Date();
        const enrollDate = getRandomDate(startDate, endDate);

        const enrollment = await Enrollment.create({
          studentId: sp.userId, // User ID of student
          classId: cls._id,
          status: 'APPROVED',
          enrollmentDate: enrollDate
        });
        enrollmentCount++;

        // Invoice logic
        const tuitionFee = cls.subjectId?.defaultTuitionFee || 1000000;
        const isPaid = Math.random() < 0.85; // 85% paid
        
        await Invoice.create({
          studentId: sp.userId,
          enrollmentId: enrollment._id,
          amount: tuitionFee,
          totalAmount: tuitionFee,
          status: isPaid ? 'PAID' : 'UNPAID',
          createdAt: enrollDate, // Đồng bộ thời gian
          dueDate: new Date(enrollDate.getTime() + 7 * 24 * 60 * 60 * 1000)
        });
        invoiceCount++;
      }
    }
    console.log(`✔ Created ${enrollmentCount} Enrollments and ${invoiceCount} Invoices.`);

    // 4. Sinh Session & Attendance (Để đồng bộ Payroll)
    let sessionCount = 0;
    let attendanceCount = 0;

    const sessionsToInsert = [];
    const attendancesToInsert = [];

    for (const cls of classes) {
      const enrolled = await Enrollment.find({ classId: cls._id, status: 'APPROVED' });
      // Pre-fetch student profiles for these enrollments
      const studentProfs = await StudentProfile.find({ userId: { $in: enrolled.map(e => e.studentId) } });
      const studentMap = new Map();
      studentProfs.forEach(sp => studentMap.set(sp.userId.toString(), sp._id));

      for (let month = 0; month <= currentMonth; month++) {
        for (let s = 1; s <= 8; s++) {
          const sessionDate = new Date(currentYear, month, Math.floor(Math.random() * 28) + 1);
          if (sessionDate > new Date()) continue;

          // Generate a pseudo-unique ID for the session to link attendances before inserting
          const sessionId = new mongoose.Types.ObjectId();

          sessionsToInsert.push({
            _id: sessionId,
            classId: cls._id,
            teacherId: cls.teacherId,
            sessionDate: sessionDate,
            startTime: new Date(sessionDate.setHours(18, 0, 0)),
            endTime: new Date(sessionDate.setHours(19, 30, 0)),
            room: cls.room || 'P.101',
            status: 'COMPLETED',
            topic: `Buổi ${s} - Tháng ${month + 1}`
          });
          sessionCount++;

          for (const en of enrolled) {
            if (en.enrollmentDate <= sessionDate) {
              const studentProfId = studentMap.get(en.studentId.toString());
              if (!studentProfId) continue;

              const isPresent = Math.random() < 0.9;
              attendancesToInsert.push({
                sessionId: sessionId,
                studentId: studentProfId,
                status: isPresent ? 'PRESENT' : 'ABSENT'
              });
              attendanceCount++;
            }
          }
        }
      }
    }

    // Insert batches safely (ignore unique constraints duplicates)
    console.log(`Prepared ${sessionsToInsert.length} Sessions and ${attendancesToInsert.length} Attendances. Inserting...`);
    try {
      await Session.insertMany(sessionsToInsert, { ordered: false });
    } catch(e) {} // ignore duplicates
    
    try {
      // Chunk attendances to avoid too large payload
      const chunkSize = 2000;
      for (let i = 0; i < attendancesToInsert.length; i += chunkSize) {
        await Attendance.insertMany(attendancesToInsert.slice(i, i + chunkSize), { ordered: false });
      }
    } catch(e) {} // ignore duplicates

    console.log(`✔ Created ${sessionCount} Sessions and ${attendanceCount} Attendances.`);

    // 5. Tính toán Payroll (Chạy theo từng tháng bằng chính controller log)
    // Thay vì gọi controller, chúng ta viết lại aggregation logic ở đây để chèn vào DB
    let payrollCount = 0;
    for (let month = 1; month <= currentMonth + 1; month++) {
      // Lấy danh sách teacher
      const teachers = await TeacherProfile.find().populate('userId');
      
      for (const tp of teachers) {
        // Tìm session của teacher trong tháng
        const startOfMonth = new Date(currentYear, month - 1, 1);
        const endOfMonth = new Date(currentYear, month, 0, 23, 59, 59);

        const sessions = await Session.find({
          teacherId: tp._id,
          status: 'COMPLETED',
          sessionDate: { $gte: startOfMonth, $lte: endOfMonth }
        });

        if (sessions.length > 0) {
          const baseSalary = 5000000;
          const sessionRate = 300000;
          const totalAmount = baseSalary + (sessions.length * sessionRate);

          await Payroll.create({
            teacherId: tp._id, // TeacherProfile ID
            month: month,
            year: currentYear,
            totalAmount: totalAmount,
            status: 'PAID'
          });
            payrollCount++;
        }
      }
    }
    console.log(`✔ Created ${payrollCount} Payrolls based on completed Sessions.`);

    console.log('✅ Sinh dữ liệu đồng bộ hoàn tất!');
    process.exit(0);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

run();
