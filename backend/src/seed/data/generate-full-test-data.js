/**
 * Script sinh file full-test-data.json
 * Chạy: node src/seed/data/generate-full-test-data.js
 */
const fs = require('fs');
const path = require('path');

// Vietnamese names pool
const hoVN = ['Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Vu', 'Vo', 'Dang', 'Bui', 'Do', 'Ngo', 'Duong', 'Ly', 'Truong', 'Dinh'];
const demVN = ['Van', 'Thi', 'Duc', 'Minh', 'Quoc', 'Thanh', 'Ngoc', 'Bao', 'Anh', 'Huu', 'Dinh', 'Xuan', 'Hong', 'Kim', 'Phuoc'];
const tenVN = ['An', 'Binh', 'Chi', 'Dung', 'Em', 'Giang', 'Hai', 'Khoa', 'Linh', 'Mai', 'Nam', 'Oanh', 'Phuc', 'Quang', 'Son', 'Tung', 'Uyen', 'Vy', 'Xuan', 'Yen', 'Huy', 'Dat', 'Khanh', 'Long', 'Minh', 'Nhi', 'Phat', 'Tam', 'Thao', 'Tien', 'Toan', 'Trung', 'Tu', 'Vinh', 'Hoa', 'Lan', 'Duc', 'Hung', 'Thinh', 'Bao'];

function pickName(i) {
  const h = hoVN[i % hoVN.length];
  const d = demVN[(i * 3) % demVN.length];
  const t = tenVN[i % tenVN.length];
  return `${h} ${d} ${t}`;
}

function pickParentName(i) {
  const h = hoVN[(i + 5) % hoVN.length];
  const d = demVN[(i * 2 + 1) % demVN.length];
  const t = tenVN[(i + 10) % tenVN.length];
  return `${h} ${d} ${t}`;
}

const pad = (n, len = 3) => String(n).padStart(len, '0');

const data = {
  meta: {
    name: "Full Test Data",
    version: "1.0",
    description: "Dataset for testing Teacher/Admin/Manager modules",
    testDataTag: "FULL_TEST_DATA_V1"
  },
  users: [],
  teacherProfiles: [],
  studentProfiles: [],
  parentProfiles: [],
  parentStudents: [],
  subjects: [],
  classes: [],
  classStudents: [],
  schedules: [],
  sessions: [],
  attendances: [],
  invoices: [],
  enrollments: [],
  payrolls: [],
  receipts: []
};

// ============ USERS ============

// Admin
data.users.push({
  key: "admin_main",
  fullName: "System Admin",
  email: "admin@gmail.com",
  password: "123456",
  phone: "0900000000",
  role: "ADMIN",
  status: "ACTIVE"
});

// Manager
data.users.push({
  key: "manager_main",
  fullName: "Center Manager",
  email: "manager@gmail.com",
  password: "123456",
  phone: "0910000000",
  role: "MANAGER",
  status: "ACTIVE"
});

// Teacher 1
data.users.push({
  key: "teacher_main",
  fullName: "Nguyen Van Teacher",
  email: "teacher@gmail.com",
  password: "123456",
  phone: "0920000001",
  role: "TEACHER",
  status: "ACTIVE"
});

// Teacher 2
data.users.push({
  key: "teacher_second",
  fullName: "Tran Thi Teacher",
  email: "teacher2@gmail.com",
  password: "123456",
  phone: "0920000002",
  role: "TEACHER",
  status: "ACTIVE"
});

// 86 Students
for (let i = 1; i <= 86; i++) {
  data.users.push({
    key: `student_${pad(i)}`,
    fullName: pickName(i),
    email: `student${pad(i)}@gmail.com`,
    password: "123456",
    phone: `093${pad(i, 7)}`,
    role: "STUDENT",
    status: i % 15 === 0 ? "INACTIVE" : "ACTIVE"
  });
}

// 50 Parents
for (let i = 1; i <= 50; i++) {
  data.users.push({
    key: `parent_${pad(i)}`,
    fullName: pickParentName(i),
    email: `parent${pad(i)}@gmail.com`,
    password: "123456",
    phone: `094${pad(i, 7)}`,
    role: "PARENT",
    status: i % 10 === 0 ? "INACTIVE" : "ACTIVE"
  });
}

// ============ TEACHER PROFILES ============

data.teacherProfiles.push({
  key: "teacher_profile_main",
  userKey: "teacher_main",
  subjects: ["Toán", "Vật lý"],
  qualification: "Cử nhân Sư phạm",
  experienceYears: 5,
  status: "ACTIVE"
});

data.teacherProfiles.push({
  key: "teacher_profile_second",
  userKey: "teacher_second",
  subjects: ["Tiếng Anh", "Hóa học"],
  qualification: "Thạc sĩ Giáo dục",
  experienceYears: 4,
  status: "ACTIVE"
});

// ============ STUDENT PROFILES ============

for (let i = 1; i <= 86; i++) {
  data.studentProfiles.push({
    key: `student_profile_${pad(i)}`,
    userKey: `student_${pad(i)}`,
    grade: i <= 15 ? "10" : i <= 31 ? "11" : i <= 48 ? "9" : i <= 66 ? "12" : "9",
    school: i <= 31 ? "THPT Nguyen Trai" : i <= 48 ? "THCS Le Loi" : i <= 66 ? "THPT Chu Van An" : "THCS Tran Phu",
    status: "ACTIVE"
  });
}

// ============ PARENT PROFILES ============

for (let i = 1; i <= 50; i++) {
  data.parentProfiles.push({
    key: `parent_profile_${pad(i)}`,
    userKey: `parent_${pad(i)}`,
    status: "ACTIVE"
  });
}

// ============ PARENT-STUDENT LINKS ============

const relationships = ["Father", "Mother", "Guardian"];
let studentIdx = 1;
// Parents 1-36: each linked to 2 students
for (let p = 1; p <= 36; p++) {
  for (let s = 0; s < 2 && studentIdx <= 86; s++) {
    data.parentStudents.push({
      key: `ps_${pad(p)}_${pad(studentIdx)}`,
      parentProfileKey: `parent_profile_${pad(p)}`,
      studentProfileKey: `student_profile_${pad(studentIdx)}`,
      relationship: relationships[(p + s) % 3],
      status: "ACTIVE"
    });
    studentIdx++;
  }
}
// Parents 37-50: each linked to 1 student
for (let p = 37; p <= 50 && studentIdx <= 86; p++) {
  data.parentStudents.push({
    key: `ps_${pad(p)}_${pad(studentIdx)}`,
    parentProfileKey: `parent_profile_${pad(p)}`,
    studentProfileKey: `student_profile_${pad(studentIdx)}`,
    relationship: relationships[p % 3],
    status: "ACTIVE"
  });
  studentIdx++;
}

// ============ SUBJECTS ============

data.subjects.push(
  { key: "subject_math_10", name: "Toán 10 Nâng Cao", gradeLevel: "10", defaultTuitionFee: 1200000, status: "ACTIVE" },
  { key: "subject_physics_11", name: "Vật Lý 11", gradeLevel: "11", defaultTuitionFee: 1300000, status: "ACTIVE" },
  { key: "subject_english_9", name: "Tiếng Anh 9", gradeLevel: "9", defaultTuitionFee: 1100000, status: "ACTIVE" },
  { key: "subject_chemistry_12", name: "Hóa Học 12", gradeLevel: "12", defaultTuitionFee: 1400000, status: "ACTIVE" },
  { key: "subject_math_9", name: "Toán 9 Luyện Thi", gradeLevel: "9", defaultTuitionFee: 1250000, status: "ACTIVE" }
);

// ============ CLASSES ============

data.classes.push(
  { key: "class_toan_10a", name: "Lớp Toán 10A", subjectKey: "subject_math_10", teacherProfileKey: "teacher_profile_main", room: "Phòng B201", maxStudents: 20, totalSessions: 30, status: "ACTIVE", startDate: "2026-06-15", endDate: "2026-09-23" },
  { key: "class_ly_11a", name: "Lớp Lý 11A", subjectKey: "subject_physics_11", teacherProfileKey: "teacher_profile_main", room: "Phòng B202", maxStudents: 20, totalSessions: 30, status: "ACTIVE", startDate: "2026-06-15", endDate: "2026-09-24" },
  { key: "class_anh_9a", name: "Lớp Anh 9A", subjectKey: "subject_english_9", teacherProfileKey: "teacher_profile_second", room: "Phòng B203", maxStudents: 20, totalSessions: 30, status: "UPCOMING", startDate: "2026-10-01", endDate: "2027-01-11" },
  { key: "class_hoa_12a", name: "Lớp Hóa 12A", subjectKey: "subject_chemistry_12", teacherProfileKey: "teacher_profile_second", room: "Phòng B204", maxStudents: 20, totalSessions: 30, status: "FINISHED", startDate: "2025-09-01", endDate: "2025-12-11" },
  { key: "class_toan_9a", name: "Lớp Toán 9A", subjectKey: "subject_math_9", teacherProfileKey: "teacher_profile_main", room: "Phòng B205", maxStudents: 20, totalSessions: 30, status: "CANCELLED", startDate: "2026-06-15", endDate: "2026-09-27" }
);

// ============ CLASS STUDENTS ============

const classStudentRanges = [
  { classKey: "class_toan_10a", from: 1, to: 15 },
  { classKey: "class_ly_11a", from: 16, to: 31 },
  { classKey: "class_anh_9a", from: 32, to: 48 },
  { classKey: "class_hoa_12a", from: 49, to: 66 },
  { classKey: "class_toan_9a", from: 67, to: 86 }
];

classStudentRanges.forEach(range => {
  let csStatus = "ACTIVE";
  let enStatus = "APPROVED";
  
  if (range.classKey === "class_anh_9a") {
    enStatus = "PENDING";
  } else if (range.classKey === "class_hoa_12a") {
    csStatus = "COMPLETED";
    enStatus = "APPROVED";
  } else if (range.classKey === "class_toan_9a") {
    csStatus = "DROPPED";
    enStatus = "CANCELLED";
  }

  for (let i = range.from; i <= range.to; i++) {
    const studentKey = `student_profile_${pad(i)}`;
    
    // Add dropout for a few active students
    let finalCsStatus = csStatus;
    if (csStatus === "ACTIVE" && i % 12 === 0) finalCsStatus = "DROPPED";

    data.classStudents.push({
      key: `cs_${range.classKey}_${pad(i)}`,
      classKey: range.classKey,
      studentProfileKey: studentKey,
      status: finalCsStatus
    });
    // Add Enrollment for each classStudent
    data.enrollments.push({
      key: `enrollment_${range.classKey}_${pad(i)}`,
      studentProfileKey: studentKey,
      classKey: range.classKey,
      status: enStatus,
      enrollmentDate: "2026-05-15",
      notes: "Enrolled from test data"
    });
  }
});

// ============ SCHEDULES ============

const slots = [
  { startTime: "07:30", endTime: "09:30" },  // Ca 1
  { startTime: "09:30", endTime: "11:30" },  // Ca 2
  { startTime: "14:00", endTime: "16:00" },  // Ca 3
  { startTime: "16:00", endTime: "18:00" },  // Ca 4
  { startTime: "18:00", endTime: "20:00" }   // Ca 5
];

const scheduleEntries = [
  { classKey: "class_toan_10a", teacherProfileKey: "teacher_profile_main",  dayOfWeek: 1, slot: 0, room: "Phòng B201" },
  { classKey: "class_toan_10a", teacherProfileKey: "teacher_profile_main",  dayOfWeek: 3, slot: 0, room: "Phòng B201" },
  { classKey: "class_ly_11a",   teacherProfileKey: "teacher_profile_main",  dayOfWeek: 2, slot: 1, room: "Phòng B202" },
  { classKey: "class_ly_11a",   teacherProfileKey: "teacher_profile_main",  dayOfWeek: 4, slot: 1, room: "Phòng B202" },
  { classKey: "class_anh_9a",   teacherProfileKey: "teacher_profile_second", dayOfWeek: 1, slot: 2, room: "Phòng B203" },
  { classKey: "class_anh_9a",   teacherProfileKey: "teacher_profile_second", dayOfWeek: 5, slot: 2, room: "Phòng B203" },
  { classKey: "class_hoa_12a",  teacherProfileKey: "teacher_profile_second", dayOfWeek: 2, slot: 3, room: "Phòng B204" },
  { classKey: "class_hoa_12a",  teacherProfileKey: "teacher_profile_second", dayOfWeek: 4, slot: 3, room: "Phòng B204" },
  { classKey: "class_toan_9a",  teacherProfileKey: "teacher_profile_main",  dayOfWeek: 3, slot: 4, room: "Phòng B205" },
  { classKey: "class_toan_9a",  teacherProfileKey: "teacher_profile_main",  dayOfWeek: 6, slot: 4, room: "Phòng B205" }
];

scheduleEntries.forEach((e, idx) => {
  let sStatus = "ACTIVE";
  if (e.classKey === "class_toan_9a") sStatus = "CANCELLED";
  
  data.schedules.push({
    key: `schedule_${pad(idx + 1)}`,
    classKey: e.classKey,
    teacherProfileKey: e.teacherProfileKey,
    dayOfWeek: e.dayOfWeek,
    startTime: slots[e.slot].startTime,
    endTime: slots[e.slot].endTime,
    room: e.room,
    status: sStatus
  });
});

// ============ SESSIONS ============

// Seed five valid sessions for the first three classes; the runtime generator
// fills each class to the standard 30 sessions when the schedule is requested.
const seededSessionDates = {
  class_toan_10a: ['2026-06-15', '2026-06-22', '2026-06-29', '2026-07-06', '2026-07-13'],
  class_ly_11a: ['2026-06-16', '2026-06-23', '2026-06-30', '2026-07-07', '2026-07-14'],
  class_anh_9a: ['2026-10-05', '2026-10-12', '2026-10-19', '2026-10-26', '2026-11-02']
};

for (let i = 1; i <= 5; i++) {
  data.sessions.push(
    { key: `session_${pad(i * 3 - 2)}`, classKey: "class_toan_10a", scheduleKey: "schedule_001", sessionDate: seededSessionDates.class_toan_10a[i - 1], topic: `Toán Đại Số phần ${i}`, status: "COMPLETED" },
    { key: `session_${pad(i * 3 - 1)}`, classKey: "class_ly_11a",   scheduleKey: "schedule_003", sessionDate: seededSessionDates.class_ly_11a[i - 1], topic: `Động Lực Học phần ${i}`, status: i <= 3 ? "COMPLETED" : "SCHEDULED" },
    { key: `session_${pad(i * 3)}`, classKey: "class_anh_9a",   scheduleKey: "schedule_005", sessionDate: seededSessionDates.class_anh_9a[i - 1], topic: `Reading Practice ${i}`, status: i <= 2 ? "COMPLETED" : "SCHEDULED" }
  );
}

// ============ ATTENDANCES ============

function generateAttendances(sessionKey, classKey, fromStudent, toStudent) {
  const total = toStudent - fromStudent + 1;
  const presentCount = Math.round(total * 0.8);
  const lateCount = Math.round(total * 0.1);
  // rest = absent

  const results = [];
  for (let i = fromStudent; i <= toStudent; i++) {
    const idx = i - fromStudent;
    let status, note;
    if (idx < presentCount) {
      status = "PRESENT";
      note = "";
    } else if (idx < presentCount + lateCount) {
      status = "LATE";
      note = "Đến trễ 10 phút";
    } else {
      status = "ABSENT";
      note = "Vắng không phép";
    }
    results.push({
      key: `att_${sessionKey}_${pad(i)}`,
      sessionKey: sessionKey,
      studentProfileKey: `student_profile_${pad(i)}`,
      status: status,
      note: note
    });
  }
  return results;
}

// Session 1: class_toan_10a students 1-15
data.attendances.push(...generateAttendances("session_001", "class_toan_10a", 1, 15));
data.attendances.push(...generateAttendances("session_004", "class_toan_10a", 1, 15));
// Session 2: class_ly_11a students 16-31
data.attendances.push(...generateAttendances("session_002", "class_ly_11a", 16, 31));

// ============ INVOICES ============

// 20 students đầu tiên (lớp Toán 10A 15 + 5 Lý 11A)
for (let i = 1; i <= 20; i++) {
  let status, paidAmount;
  const classKey = i <= 15 ? "class_toan_10a" : "class_ly_11a";
  const amount = i <= 15 ? 1200000 : 1300000;

  if (i <= 10) {
    status = "PAID";
    paidAmount = amount;
  } else if (i <= 17) {
    status = "UNPAID";
    paidAmount = 0;
  } else {
    status = "PARTIAL";
    paidAmount = Math.round(amount / 2);
  }

  data.invoices.push({
    key: `invoice_${pad(i)}`,
    studentProfileKey: `student_profile_${pad(i)}`,
    classKey: classKey,
    amount: amount,
    month: "2026-06",
    dueDate: "2026-06-30",
    status: status,
    paidAmount: paidAmount
  });

  // Create receipts for invoices
  if (status === "PAID" || status === "PARTIAL") {
    data.receipts.push({
      key: `receipt_${pad(i)}`,
      invoiceKey: `invoice_${pad(i)}`,
      studentProfileKey: `student_profile_${pad(i)}`,
      amountPaid: paidAmount,
      paymentDate: "2026-06-15",
      paymentMethod: "BANK_TRANSFER",
      transactionId: `TXN${10000 + i}`,
      notes: "Payment for tuition fee"
    });
  }
}

// ============ PAYROLLS ============
data.payrolls.push({
  key: "payroll_teacher1_06",
  teacherProfileKey: "teacher_profile_main",
  month: 6,
  year: 2026,
  totalSessions: 12,
  baseAmount: 6000000,
  bonusAmount: 500000,
  totalAmount: 6500000,
  status: "PAID",
  details: []
}, {
  key: "payroll_teacher2_06",
  teacherProfileKey: "teacher_profile_second",
  month: 6,
  year: 2026,
  totalSessions: 8,
  baseAmount: 4000000,
  bonusAmount: 0,
  totalAmount: 4000000,
  status: "DRAFT",
  details: []
});

// ============ WRITE FILE ============

const outputPath = path.join(__dirname, 'full-test-data.json');
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');

// Validate counts
console.log('=== VALIDATION ===');
console.log(`Users: ${data.users.length} (expect 140 = 1 admin + 1 manager + 2 teachers + 86 students + 50 parents)`);
console.log(`TeacherProfiles: ${data.teacherProfiles.length} (expect 2)`);
console.log(`StudentProfiles: ${data.studentProfiles.length} (expect 86)`);
console.log(`ParentProfiles: ${data.parentProfiles.length} (expect 50)`);
console.log(`ParentStudents: ${data.parentStudents.length} (expect 86)`);
console.log(`Subjects: ${data.subjects.length} (expect 5)`);
console.log(`Classes: ${data.classes.length} (expect 5)`);
console.log(`ClassStudents: ${data.classStudents.length} (expect 86)`);
console.log(`Enrollments: ${data.enrollments.length} (expect 86)`);
console.log(`Schedules: ${data.schedules.length} (expect 10)`);
console.log(`Sessions: ${data.sessions.length} (expect 15)`);
console.log(`Attendances: ${data.attendances.length} (expect 46)`);
console.log(`Invoices: ${data.invoices.length} (expect 20)`);
console.log(`Receipts: ${data.receipts.length} (expect 13)`);
console.log(`Payrolls: ${data.payrolls.length} (expect 2)`);

// Class size verification
classStudentRanges.forEach(r => {
  const count = data.classStudents.filter(cs => cs.classKey === r.classKey).length;
  console.log(`  ${r.classKey}: ${count} students`);
});

// Schedule conflict check
const scheduleMap = {};
let conflicts = 0;
data.schedules.forEach(s => {
  const teacherSlot = `teacher:${s.teacherProfileKey}_day:${s.dayOfWeek}_time:${s.startTime}`;
  const roomSlot = `room:${s.room}_day:${s.dayOfWeek}_time:${s.startTime}`;
  if (scheduleMap[teacherSlot]) { console.error(`CONFLICT teacher: ${teacherSlot}`); conflicts++; }
  if (scheduleMap[roomSlot]) { console.error(`CONFLICT room: ${roomSlot}`); conflicts++; }
  scheduleMap[teacherSlot] = true;
  scheduleMap[roomSlot] = true;
});
console.log(`Schedule conflicts: ${conflicts}`);

console.log(`\n✅ File saved to: ${outputPath}`);
