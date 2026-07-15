/**
 * Seed script: Đọc full-test-data.json và insert vào MongoDB
 * Chạy lệnh: npm run seed:full-test
 *
 * Cleanup dữ liệu cũ theo testDataTag trước khi insert.
 * Dữ liệu ngoài test data sẽ KHÔNG bị ảnh hưởng.
 */

require('dotenv').config({ path: '../../.env' });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ============ IMPORT MODELS ============
const User = require('../models/User');
const TeacherProfile = require('../models/TeacherProfile');
const StudentProfile = require('../models/StudentProfile');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const ClassStudent = require('../models/ClassStudent');
const Schedule = require('../models/Schedule');
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');
const { ensureSessionsForClass } = require('../modules/teacher/session-generation.service');

// Models mới
let ParentProfile, ParentStudent, Invoice, Enrollment, Payroll, Receipt;
try { ParentProfile = require('../models/ParentProfile'); } catch (e) { console.warn('⚠ Model ParentProfile chưa tồn tại, sẽ bỏ qua.'); }
try { ParentStudent = require('../models/ParentStudent'); } catch (e) { console.warn('⚠ Model ParentStudent chưa tồn tại, sẽ bỏ qua.'); }
try { Invoice = require('../models/Invoice'); } catch (e) { console.warn('⚠ Model Invoice chưa tồn tại, sẽ bỏ qua.'); }
try { Enrollment = require('../models/Enrollment'); } catch (e) { console.warn('⚠ Model Enrollment chưa tồn tại, sẽ bỏ qua.'); }
try { Payroll = require('../models/Payroll'); } catch (e) { console.warn('⚠ Model Payroll chưa tồn tại, sẽ bỏ qua.'); }
try { Receipt = require('../models/Receipt'); } catch (e) { console.warn('⚠ Model Receipt chưa tồn tại, sẽ bỏ qua.'); }

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sdn302_db';
const TEST_TAG = 'FULL_TEST_DATA_V1';

// dayOfWeek mapping for Schedule model
const DAY_MAP = {
  'Sunday': '0', 'Monday': '1', 'Tuesday': '2', 'Wednesday': '3',
  'Thursday': '4', 'Friday': '5', 'Saturday': '6',
  '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6',
  0: '0', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6'
};

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✔ MongoDB connected');

    // ============ 1. ĐỌC JSON ============
    const dataPath = path.join(__dirname, 'data', 'full-test-data.json');
    if (!fs.existsSync(dataPath)) {
      throw new Error('Không tìm thấy file full-test-data.json. Hãy chạy generate-full-test-data.js trước.');
    }
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    console.log(`✔ Đọc JSON thành công (tag: ${data.meta.testDataTag})`);

    // ============ 2. CLEANUP DỮ LIỆU CŨ ============
    console.log('\n--- CLEANUP DỮ LIỆU TEST CŨ ---');

    // Collect emails từ JSON để cleanup chính xác
    const testEmails = data.users.map(u => u.email);

    // Tìm User test cũ
    const oldUsers = await User.find({ email: { $in: testEmails } });
    const oldUserIds = oldUsers.map(u => u._id);

    if (oldUserIds.length > 0) {
      // Tìm profile IDs liên quan
      const oldTeacherProfiles = await TeacherProfile.find({ userId: { $in: oldUserIds } });
      const oldTeacherProfileIds = oldTeacherProfiles.map(t => t._id);

      const oldStudentProfiles = await StudentProfile.find({ userId: { $in: oldUserIds } });
      const oldStudentProfileIds = oldStudentProfiles.map(s => s._id);

      // Tìm Classes thuộc teacher test
      const oldClasses = await Class.find({ teacherId: { $in: oldTeacherProfileIds } });
      const oldClassIds = oldClasses.map(c => c._id);

      // Xóa Attendance -> Session -> Schedule -> ClassStudent -> Class (theo thứ tự phụ thuộc)
      if (oldClassIds.length > 0) {
        const oldSessions = await Session.find({ classId: { $in: oldClassIds } });
        const oldSessionIds = oldSessions.map(s => s._id);

        if (oldSessionIds.length > 0) {
          const delAtt = await Attendance.deleteMany({ sessionId: { $in: oldSessionIds } });
          console.log(`  Xóa ${delAtt.deletedCount} Attendance cũ`);
        }
        const delSess = await Session.deleteMany({ classId: { $in: oldClassIds } });
        console.log(`  Xóa ${delSess.deletedCount} Session cũ`);

        const delSched = await Schedule.deleteMany({ classId: { $in: oldClassIds } });
        console.log(`  Xóa ${delSched.deletedCount} Schedule cũ`);

        const delCS = await ClassStudent.deleteMany({ classId: { $in: oldClassIds } });
        console.log(`  Xóa ${delCS.deletedCount} ClassStudent cũ`);

        if (Invoice) {
          if (Receipt) {
            const oldInvoices = await Invoice.find({ classId: { $in: oldClassIds } });
            const oldInvoiceIds = oldInvoices.map(i => i._id);
            if (oldInvoiceIds.length > 0) {
              const delRec = await Receipt.deleteMany({ invoiceId: { $in: oldInvoiceIds } });
              console.log(`  Xóa ${delRec.deletedCount} Receipt cũ`);
            }
          }
          const delInv = await Invoice.deleteMany({ classId: { $in: oldClassIds } });
          console.log(`  Xóa ${delInv.deletedCount} Invoice cũ`);
        }

        if (Enrollment) {
          const delEnroll = await Enrollment.deleteMany({ classId: { $in: oldClassIds } });
          console.log(`  Xóa ${delEnroll.deletedCount} Enrollment cũ`);
        }

        const delClass = await Class.deleteMany({ _id: { $in: oldClassIds } });
        console.log(`  Xóa ${delClass.deletedCount} Class cũ`);
      }

      // Xóa ParentStudent & ParentProfile
      if (ParentStudent && oldStudentProfileIds.length > 0) {
        const delPS = await ParentStudent.deleteMany({ studentId: { $in: oldStudentProfileIds } });
        console.log(`  Xóa ${delPS.deletedCount} ParentStudent cũ`);
      }
      if (ParentProfile) {
        const oldParentProfiles = await ParentProfile.find({ userId: { $in: oldUserIds } });
        if (oldParentProfiles.length > 0) {
          const delPP = await ParentProfile.deleteMany({ userId: { $in: oldUserIds } });
          console.log(`  Xóa ${delPP.deletedCount} ParentProfile cũ`);
        }
      }

      // Xóa Subject test
      const testSubjectNames = data.subjects.map(s => s.name);
      const delSubj = await Subject.deleteMany({ name: { $in: testSubjectNames } });
      console.log(`  Xóa ${delSubj.deletedCount} Subject cũ`);

      // Xóa Payrolls
      if (Payroll) {
        const delPay = await Payroll.deleteMany({ teacherId: { $in: oldTeacherProfileIds } });
        console.log(`  Xóa ${delPay.deletedCount} Payroll cũ`);
      }

      // Xóa Profiles
      const delTP = await TeacherProfile.deleteMany({ userId: { $in: oldUserIds } });
      console.log(`  Xóa ${delTP.deletedCount} TeacherProfile cũ`);
      const delSP = await StudentProfile.deleteMany({ userId: { $in: oldUserIds } });
      console.log(`  Xóa ${delSP.deletedCount} StudentProfile cũ`);

      // Xóa Users
      const delUser = await User.deleteMany({ email: { $in: testEmails } });
      console.log(`  Xóa ${delUser.deletedCount} User cũ`);
    } else {
      console.log('  Không có dữ liệu test cũ cần xóa.');
    }

    // ============ 3. HASH PASSWORD ============
    console.log('\n--- HASH PASSWORD ---');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    console.log('✔ Password "123456" đã được hash');

    // ============ 4. MAPS ĐỂ LƯU QUAN HỆ KEY -> ObjectId ============
    const userMap = new Map();
    const teacherProfileMap = new Map();
    const studentProfileMap = new Map();
    const parentProfileMap = new Map();
    const subjectMap = new Map();
    const classMap = new Map();
    const scheduleMap = new Map();
    const sessionMap = new Map();
    const invoiceMap = new Map();

    // ============ 5. INSERT THEO THỨ TỰ ============
    console.log('\n--- INSERT DỮ LIỆU MỚI ---');

    // --- 5.1 USERS ---
    console.log('⚠ User: JSON có phone, status nhưng Schema chỉ có name, isActive. Bỏ qua phone, map status -> isActive.');
    const userDocs = data.users.map(u => ({
      name: u.fullName,
      email: u.email,
      password: hashedPassword,
      role: u.role.toLowerCase(),
      isActive: u.status === 'ACTIVE',
    }));
    const createdUsers = await User.insertMany(userDocs);
    // Map key -> _id
    data.users.forEach((u, i) => {
      userMap.set(u.key, createdUsers[i]._id);
    });
    console.log(`✔ Users created: ${createdUsers.length}`);

    // --- 5.2 TEACHER PROFILES ---
    console.log('⚠ TeacherProfile: JSON có status nhưng Schema không có. Bỏ qua status.');
    const tpDocs = data.teacherProfiles.map(tp => ({
      userId: userMap.get(tp.userKey),
      specialization: tp.subjects || [],
      experienceYears: tp.experienceYears || 0,
      bio: tp.qualification || '',
      phoneNumber: '',
    }));
    const createdTP = await TeacherProfile.insertMany(tpDocs);
    data.teacherProfiles.forEach((tp, i) => {
      teacherProfileMap.set(tp.key, createdTP[i]._id);
    });
    console.log(`✔ TeacherProfiles created: ${createdTP.length}`);

    // --- 5.3 STUDENT PROFILES ---
    console.log('⚠ StudentProfile: JSON không có dateOfBirth, gender, address. Bỏ qua các field này, Schema cũng không yêu cầu bắt buộc.');
    const spDocs = data.studentProfiles.map(sp => ({
      userId: userMap.get(sp.userKey),
      grade: sp.grade || '',
      school: sp.school || '',
      parentName: '',
      parentPhone: '',
    }));
    const createdSP = await StudentProfile.insertMany(spDocs);
    data.studentProfiles.forEach((sp, i) => {
      studentProfileMap.set(sp.key, createdSP[i]._id);
    });
    console.log(`✔ StudentProfiles created: ${createdSP.length}`);

    // --- 5.4 PARENT PROFILES ---
    let createdPPCount = 0;
    if (ParentProfile && data.parentProfiles && data.parentProfiles.length > 0) {
      console.log('⚠ ParentProfile: JSON có status nhưng Schema không có. Bỏ qua status.');
      const ppDocs = data.parentProfiles.map(pp => ({
        userId: userMap.get(pp.userKey),
      }));
      const createdPP = await ParentProfile.insertMany(ppDocs);
      data.parentProfiles.forEach((pp, i) => {
        parentProfileMap.set(pp.key, createdPP[i]._id);
      });
      createdPPCount = createdPP.length;
    }
    console.log(`✔ ParentProfiles created: ${createdPPCount}`);

    // --- 5.5 PARENT STUDENTS ---
    let createdPSCount = 0;
    if (ParentStudent && data.parentStudents && data.parentStudents.length > 0) {
      const psDocs = data.parentStudents.map(ps => ({
        parentId: parentProfileMap.get(ps.parentProfileKey),
        studentId: studentProfileMap.get(ps.studentProfileKey),
        relationship: ps.relationship || 'Guardian',
        status: 'active',
      }));
      const createdPS = await ParentStudent.insertMany(psDocs);
      createdPSCount = createdPS.length;
    }
    console.log(`✔ ParentStudents created: ${createdPSCount}`);

    // --- 5.6 SUBJECTS ---
    const subjDocs = data.subjects.map(s => ({
      name: s.name,
      description: s.name,
      gradeLevel: String(s.gradeLevel),
      defaultTuitionFee: s.defaultTuitionFee || 0,
      status: 'active',
    }));
    const createdSubj = await Subject.insertMany(subjDocs);
    data.subjects.forEach((s, i) => {
      subjectMap.set(s.key, createdSubj[i]._id);
    });
    console.log(`✔ Subjects created: ${createdSubj.length}`);

    // --- 5.7 CLASSES ---
    console.log('⚠ Class: Map status "ACTIVE" -> "ongoing" vì Schema chỉ nhận scheduled, ongoing, completed, cancelled.');
    const classDocs = data.classes.map(c => ({
      name: c.name,
      subjectId: subjectMap.get(c.subjectKey),
      teacherId: teacherProfileMap.get(c.teacherProfileKey),
      room: c.room || '',
      maxStudents: c.maxStudents || 20,
      totalSessions: 30,
      startDate: new Date(c.startDate),
      endDate: new Date(c.endDate),
      status: c.status === 'ACTIVE' ? 'ongoing' : 'scheduled',
    }));
    const createdClass = await Class.insertMany(classDocs);
    data.classes.forEach((c, i) => {
      classMap.set(c.key, createdClass[i]._id);
    });
    console.log(`✔ Classes created: ${createdClass.length}`);

    // --- 5.8 CLASS STUDENTS ---
    console.log('⚠ ClassStudent: Map status "ACTIVE" -> "enrolled" vì Schema chỉ nhận enrolled, completed, dropped.');
    const csDocs = data.classStudents.map(cs => ({
      classId: classMap.get(cs.classKey),
      studentId: studentProfileMap.get(cs.studentProfileKey),
      status: cs.status === 'ACTIVE' ? 'enrolled' : 'completed',
    }));
    const createdCS = await ClassStudent.insertMany(csDocs);
    console.log(`✔ ClassStudents created: ${createdCS.length}`);

    // --- 5.8.5 ENROLLMENTS ---
    let createdEnrollCount = 0;
    if (Enrollment && data.enrollments && data.enrollments.length > 0) {
      // Find User ID corresponding to StudentProfile ID
      // studentProfileMap.get() returns the StudentProfile ID.
      // EnrollmentSchema requires studentId as User ID!
      const enrollDocs = [];
      for (const en of data.enrollments) {
        const spId = studentProfileMap.get(en.studentProfileKey);
        const spDoc = createdSP.find(sp => sp._id.toString() === spId.toString());
        if (spDoc) {
          enrollDocs.push({
            studentId: spDoc.userId, // This is the User ID!
            classId: classMap.get(en.classKey),
            status: en.status || 'APPROVED',
            enrollmentDate: new Date(en.enrollmentDate),
            notes: en.notes || ''
          });
        }
      }
      const createdEnroll = await Enrollment.insertMany(enrollDocs);
      createdEnrollCount = createdEnroll.length;
    }
    console.log(`✔ Enrollments created: ${createdEnrollCount}`);

    // --- 5.9 SCHEDULES ---
    const schedDocs = data.schedules.map(s => ({
      classId: classMap.get(s.classKey),
      teacherId: teacherProfileMap.get(s.teacherProfileKey),
      dayOfWeek: DAY_MAP[s.dayOfWeek] || s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      room: s.room || '',
      status: 'active',
    }));
    const createdSched = await Schedule.insertMany(schedDocs);
    data.schedules.forEach((s, i) => {
      scheduleMap.set(s.key, createdSched[i]._id);
    });
    console.log(`✔ Schedules created: ${createdSched.length}`);

    // --- 5.10 SESSIONS ---
    const sessDocs = data.sessions.map(s => {
      // Find the corresponding schedule in data.schedules to get required fields
      const scheduleData = data.schedules.find(sched => sched.key === s.scheduleKey);
      
      // Create proper Date objects for startTime and endTime
      const sessDate = new Date(s.sessionDate);
      const startD = new Date(sessDate);
      const endD = new Date(sessDate);
      
      if (scheduleData) {
        const [startH, startM] = scheduleData.startTime.split(':');
        startD.setHours(parseInt(startH), parseInt(startM), 0);
        
        const [endH, endM] = scheduleData.endTime.split(':');
        endD.setHours(parseInt(endH), parseInt(endM), 0);
      }
      
      return {
        classId: classMap.get(s.classKey),
        scheduleId: scheduleMap.get(s.scheduleKey),
        sessionDate: sessDate,
        topic: s.topic || '',
        status: s.status || 'SCHEDULED',
        teacherId: scheduleData ? teacherProfileMap.get(scheduleData.teacherProfileKey) : null,
        room: scheduleData ? (scheduleData.room || 'N/A') : 'N/A',
        startTime: startD,
        endTime: endD
      };
    });
    const createdSess = await Session.insertMany(sessDocs);
    data.sessions.forEach((s, i) => {
      sessionMap.set(s.key, createdSess[i]._id);
    });

    // Complete every seeded class to 30 sessions and align endDate with the
    // final generated session.
    await Promise.all(data.classes.map((classData) => ensureSessionsForClass(
      classMap.get(classData.key),
      teacherProfileMap.get(classData.teacherProfileKey)
    )));
    console.log(`✔ Sessions created: ${createdSess.length}`);

    // --- 5.11 ATTENDANCES ---
    const attDocs = data.attendances.map(a => ({
      sessionId: sessionMap.get(a.sessionKey),
      studentId: studentProfileMap.get(a.studentProfileKey),
      status: a.status || 'PRESENT',
      note: a.note || '',
    }));
    const createdAtt = await Attendance.insertMany(attDocs);
    console.log(`✔ Attendances created: ${createdAtt.length}`);

    // --- 5.12 INVOICES ---
    let createdInvCount = 0;
    if (Invoice && data.invoices && data.invoices.length > 0) {
      console.log('⚠ Invoice: JSON không có paymentDate, note. Schema không yêu cầu paymentDate, bổ sung default note rỗng.');
      const invDocs = [];
      for (const inv of data.invoices) {
        const spId = studentProfileMap.get(inv.studentProfileKey);
        const spDoc = createdSP.find(sp => sp._id.toString() === spId.toString());
        if (spDoc) {
          invDocs.push({
            studentId: spDoc.userId, // This is User ID
            amount: inv.amount,
            totalAmount: inv.amount,
            discount: 0,
            status: inv.status || 'UNPAID',
            dueDate: new Date(inv.dueDate),
            notes: inv.note || ''
          });
        }
      }
      const createdInv = await Invoice.insertMany(invDocs);
      data.invoices.forEach((inv, i) => {
        invoiceMap.set(inv.key, createdInv[i]._id);
      });
      createdInvCount = createdInv.length;
    }
    console.log(`✔ Invoices created: ${createdInvCount}`);

    // --- 5.13 RECEIPTS ---
    let createdRecCount = 0;
    if (Receipt && data.receipts && data.receipts.length > 0) {
      const recDocs = [];
      for (const rec of data.receipts) {
        const spId = studentProfileMap.get(rec.studentProfileKey);
        const spDoc = createdSP.find(sp => sp._id.toString() === spId.toString());
        if (spDoc && invoiceMap.has(rec.invoiceKey)) {
          recDocs.push({
            invoiceId: invoiceMap.get(rec.invoiceKey),
            studentId: spDoc.userId, // This is User ID
            amountPaid: rec.amountPaid,
            paymentDate: new Date(rec.paymentDate),
            paymentMethod: rec.paymentMethod || 'BANK_TRANSFER',
            transactionId: rec.transactionId || '',
            notes: rec.notes || ''
          });
        }
      }
      const createdRec = await Receipt.insertMany(recDocs);
      createdRecCount = createdRec.length;
    }
    console.log(`✔ Receipts created: ${createdRecCount}`);

    // --- 5.14 PAYROLLS ---
    let createdPayCount = 0;
    if (Payroll && data.payrolls && data.payrolls.length > 0) {
      const payDocs = data.payrolls.map(pay => ({
        teacherId: teacherProfileMap.get(pay.teacherProfileKey),
        month: pay.month,
        year: pay.year,
        totalSessions: pay.totalSessions,
        baseAmount: pay.baseAmount,
        bonusAmount: pay.bonusAmount,
        totalAmount: pay.totalAmount,
        status: pay.status || 'DRAFT',
        details: []
      }));
      const createdPay = await Payroll.insertMany(payDocs);
      createdPayCount = createdPay.length;
    }
    console.log(`✔ Payrolls created: ${createdPayCount}`);

    // ============ 6. TỔNG KẾT ============
    console.log('\n========================================');
    console.log('✅ SEED HOÀN TẤT!');
    console.log('========================================');
    console.log(`  Users:           ${createdUsers.length}`);
    console.log(`  TeacherProfiles: ${createdTP.length}`);
    console.log(`  StudentProfiles: ${createdSP.length}`);
    console.log(`  ParentProfiles:  ${createdPPCount}`);
    console.log(`  ParentStudents:  ${createdPSCount}`);
    console.log(`  Subjects:        ${createdSubj.length}`);
    console.log(`  Classes:         ${createdClass.length}`);
    console.log(`  ClassStudents:   ${createdCS.length}`);
    console.log(`  Enrollments:     ${createdEnrollCount}`);
    console.log(`  Schedules:       ${createdSched.length}`);
    console.log(`  Sessions:        ${createdSess.length}`);
    console.log(`  Attendances:     ${createdAtt.length}`);
    console.log(`  Invoices:        ${createdInvCount}`);
    console.log(`  Receipts:        ${createdRecCount}`);
    console.log(`  Payrolls:        ${createdPayCount}`);
    console.log('----------------------------------------');
    console.log('Tài khoản test (password: 123456):');
    console.log('  Admin:     admin@gmail.com');
    console.log('  Manager:   manager@gmail.com');
    console.log('  Teacher 1: teacher@gmail.com');
    console.log('  Teacher 2: teacher2@gmail.com');
    console.log('  Students:  student001@gmail.com -> student086@gmail.com');
    console.log('  Parents:   parent001@gmail.com  -> parent050@gmail.com');
    console.log('========================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ SEED THẤT BẠI:');
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'unknown';
      console.error(`  Lỗi duplicate key ở field "${field}".`);
      console.error(`  Value: ${JSON.stringify(error.keyValue)}`);
      console.error('  Có thể dữ liệu test cũ chưa được cleanup sạch. Hãy chạy lại script.');
    } else {
      console.error(' ', error.message || error);
    }
    await mongoose.disconnect();
    process.exit(1);
  }
};

run();
