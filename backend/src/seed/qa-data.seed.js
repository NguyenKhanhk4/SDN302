require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import all models
const User = require('../models/User');
const TeacherProfile = require('../models/TeacherProfile');
const StudentProfile = require('../models/StudentProfile');
const ParentProfile = require('../models/ParentProfile');
const ParentStudent = require('../models/ParentStudent');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const ClassStudent = require('../models/ClassStudent');
const Schedule = require('../models/Schedule');
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');
const Invoice = require('../models/Invoice');
const Receipt = require('../models/Receipt');
const Payroll = require('../models/Payroll');
const Enrollment = require('../models/Enrollment');
const Announcement = require('../models/Announcement');
const SupportRequest = require('../models/SupportRequest');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sdn302_db';

const firstNames = ['An', 'Bình', 'Châu', 'Dũng', 'Em', 'Phong', 'Giang', 'Hùng', 'Linh', 'Minh', 'Ngọc', 'Quang', 'Sơn', 'Tuấn', 'Uyên', 'Vinh', 'Xuân', 'Yến', 'Hải', 'Hoa'];
const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];

const getRandomName = () => `${lastNames[Math.floor(Math.random() * lastNames.length)]} ${firstNames[Math.floor(Math.random() * firstNames.length)]}`;
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    console.log('Dropping existing database...');
    await mongoose.connection.db.dropDatabase();
    console.log('Database dropped.');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('123456', salt);

    console.log('Creating Admin...');
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@gmail.com',
      password: '123456',
      role: 'admin',
      isActive: true,
      phone: '0900000000',
    });

    console.log('Creating other roles...');
    const usersData = [];
    const roles = { teacher: 20, student: 20, parent: 20, manager: 5 };
    let counters = { teacher: 1, student: 1, parent: 1, manager: 1 };

    for (const [role, count] of Object.entries(roles)) {
      for (let i = 0; i < count; i++) {
        usersData.push({
          name: getRandomName(),
          email: `${role}${counters[role]++}@gmail.com`,
          password: passwordHash,
          role,
          isActive: getRandomInt(1, 10) > 1, // 90% active
          phone: `09${Math.floor(Math.random() * 100000000)}`,
        });
      }
    }
    const createdUsers = await User.insertMany(usersData);

    const teachers = createdUsers.filter(u => u.role === 'teacher');
    const students = createdUsers.filter(u => u.role === 'student');
    const parents = createdUsers.filter(u => u.role === 'parent');

    console.log('Creating Profiles...');
    const teacherProfiles = await TeacherProfile.insertMany(teachers.map(t => ({
      userId: t._id,
      specialization: [getRandomElement(['Toán', 'Lý', 'Hóa', 'Anh', 'Văn', 'Sinh', 'Sử', 'Địa'])],
      experienceYears: getRandomInt(1, 15),
      bio: 'Giáo viên ưu tú',
      phoneNumber: t.phone
    })));

    const studentProfiles = await StudentProfile.insertMany(students.map(s => ({
      userId: s._id,
      grade: `Khối ${getRandomInt(6, 12)}`,
      school: `Trường THPT ${getRandomName().split(' ')[1]}`,
    })));

    const parentProfiles = await ParentProfile.insertMany(parents.map(p => ({
      userId: p._id,
    })));

    console.log('Creating Parent-Student connections...');
    const parentStudents = [];
    for (let i = 0; i < 20; i++) {
      parentStudents.push({
        parentId: parentProfiles[i]._id,
        studentId: studentProfiles[i]._id,
        relationship: getRandomElement(['father', 'mother', 'guardian', 'other']),
        status: 'active'
      });
    }
    await ParentStudent.insertMany(parentStudents);

    console.log('Creating Subjects...');
    const subjectsData = [];
    for (let i = 1; i <= 20; i++) {
      subjectsData.push({
        name: `Môn học ${i}`,
        description: `Mô tả môn học ${i}`,
        gradeLevel: String(getRandomInt(6, 12)),
        defaultTuitionFee: getRandomInt(5, 20) * 100000,
        status: 'active'
      });
    }
    const subjects = await Subject.insertMany(subjectsData);

    console.log('Creating Classes...');
    const classStatuses = ['scheduled', 'ongoing', 'completed', 'cancelled'];
    const classesData = [];
    for (let i = 1; i <= 20; i++) {
      classesData.push({
        name: `Lớp ${i}`,
        subjectId: getRandomElement(subjects)._id,
        teacherId: getRandomElement(teacherProfiles)._id,
        room: `Phòng ${getRandomInt(100, 500)}`,
        maxStudents: 20,
        totalSessions: 30,
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
        status: getRandomElement(classStatuses)
      });
    }
    const classes = await Class.insertMany(classesData);

    console.log('Creating ClassStudents & Enrollments...');
    const classStudentData = [];
    const enrollmentData = [];
    const csStatuses = ['enrolled', 'completed', 'dropped'];
    const enrolStatuses = ['PENDING', 'APPROVED', 'CANCELLED'];

    for (let c of classes) {
      const shuffledStudents = [...studentProfiles].sort(() => 0.5 - Math.random());
      const selectedStudents = shuffledStudents.slice(0, 3);
      for (let student of selectedStudents) {
        classStudentData.push({
          classId: c._id,
          studentId: student._id,
          status: getRandomElement(csStatuses)
        });
        
        enrollmentData.push({
          studentId: student.userId, // Uses User ID
          classId: c._id,
          status: getRandomElement(enrolStatuses),
          enrollmentDate: new Date(),
          notes: 'QA generated'
        });
      }
    }
    await ClassStudent.insertMany(classStudentData);
    await Enrollment.insertMany(enrollmentData);

    console.log('Creating Schedules & Sessions...');
    const schedulesData = [];
    const sessionsData = [];
    const sessionStatuses = ['SCHEDULED', 'COMPLETED', 'CANCELLED'];

    for (let c of classes) {
      const schedule = await Schedule.create({
        classId: c._id,
        teacherId: c.teacherId,
        dayOfWeek: String(getRandomInt(0, 6)),
        startTime: '08:00',
        endTime: '10:00',
        room: c.room,
        status: 'active'
      });
      schedulesData.push(schedule);

      for(let j=0; j<5; j++) {
         let date = new Date();
         date.setDate(date.getDate() + (j - 2)); // Some past, some future
         sessionsData.push({
            classId: c._id,
            scheduleId: schedule._id,
            sessionDate: date,
            topic: `Topic ${j+1}`,
            status: getRandomElement(sessionStatuses),
            teacherId: c.teacherId,
            room: c.room,
            startTime: new Date(date.setHours(8, 0, 0)),
            endTime: new Date(date.setHours(10, 0, 0))
         });
      }
    }
    const sessions = await Session.insertMany(sessionsData);

    console.log('Creating Attendances...');
    const attendancesData = [];
    const attStatuses = ['PRESENT', 'ABSENT', 'EXCUSED', 'LATE'];
    
    // Create attendance only for class students of the session's class
    for(let session of sessions.filter(s => s.status === 'COMPLETED')) {
       const csInClass = classStudentData.filter(cs => cs.classId === session.classId);
       for(let cs of csInClass) {
          attendancesData.push({
             sessionId: session._id,
             studentId: cs.studentId,
             status: getRandomElement(attStatuses),
             note: 'QA generated note'
          });
       }
    }
    await Attendance.insertMany(attendancesData);

    console.log('Creating Invoices & Receipts...');
    const invoicesData = [];
    const invStatuses = ['UNPAID', 'PARTIAL', 'PAID', 'CANCELLED'];
    for(let i=0; i<20; i++) {
        const student = getRandomElement(studentProfiles);
        const amount = getRandomInt(10, 50) * 100000;
        invoicesData.push({
            studentId: student.userId,
            classId: getRandomElement(classes)._id,
            amount: amount,
            totalAmount: amount,
            discount: 0,
            status: getRandomElement(invStatuses),
            dueDate: new Date(new Date().setDate(new Date().getDate() + 10)),
            notes: 'QA Invoice'
        });
    }
    const invoices = await Invoice.insertMany(invoicesData);

    const receiptsData = [];
    for(let inv of invoices.filter(i => i.status === 'PAID' || i.status === 'PARTIAL')) {
        receiptsData.push({
            invoiceId: inv._id,
            studentId: inv.studentId,
            amountPaid: inv.status === 'PAID' ? inv.amount : inv.amount / 2,
            paymentDate: new Date(),
            paymentMethod: getRandomElement(['BANK_TRANSFER', 'CASH']),
            transactionId: `TXN${getRandomInt(1000, 9999)}`,
            notes: 'QA Receipt'
        });
    }
    await Receipt.insertMany(receiptsData);

    console.log('Creating Payrolls...');
    const payrollsData = [];
    const payStatuses = ['DRAFT', 'APPROVED', 'PAID'];
    for(let t of teacherProfiles) {
        payrollsData.push({
            teacherId: t._id,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            totalSessions: getRandomInt(10, 30),
            baseAmount: 10000000,
            bonusAmount: 1000000,
            totalAmount: 11000000,
            status: getRandomElement(payStatuses),
            details: []
        });
    }
    await Payroll.insertMany(payrollsData);

    console.log('Creating Announcements & SupportRequests...');
    const announcementsData = [];
    for(let i=0; i<5; i++) {
        announcementsData.push({
            title: `Announcement ${i+1}`,
            content: `Content for announcement ${i+1}`,
            senderId: admin._id,
            targetRole: getRandomElement(['ALL', 'STUDENT', 'TEACHER', 'PARENT'])
        });
    }
    await Announcement.insertMany(announcementsData);

    const supportRequestsData = [];
    const reqStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'RESOLVED'];
    for(let i=0; i<10; i++) {
        supportRequestsData.push({
            studentId: getRandomElement(studentProfiles)._id,
            type: getRandomElement(['LEAVE', 'FEEDBACK', 'CONTACT']),
            title: `Support Request ${i+1}`,
            content: 'Please help with this issue',
            classId: getRandomElement(classes)._id,
            status: getRandomElement(reqStatuses)
        });
    }
    await SupportRequest.insertMany(supportRequestsData);

    console.log('==============================================');
    console.log('QA SEED DATA CREATED SUCCESSFULLY!');
    console.log(`Created 1 Admin, ${teachers.length} Teachers, ${students.length} Students, ${parents.length} Parents`);
    console.log(`Created ${subjects.length} Subjects, ${classes.length} Classes, ${sessions.length} Sessions`);
    console.log('Login with: admin@gmail.com / 123456');
    console.log('Other logins: student1@gmail.com, teacher1@gmail.com, parent1@gmail.com / 123456');
    console.log('==============================================');

    process.exit(0);
  } catch (error) {
    console.error('SEED ERROR:', error);
    process.exit(1);
  }
};

seedDatabase();
