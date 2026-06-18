const fs = require('fs');
const path = require('path');
const { Types } = require('mongoose');

// Helper to generate a new ObjectId string
const newId = () => new Types.ObjectId().toString();

const data = {
  users: [],
  teacherProfiles: [],
  studentProfiles: [],
  subjects: [],
  classes: [],
  classStudents: [],
  schedules: [],
  sessions: [],
  attendances: []
};

// 1 Admin & 1 Manager
const adminId = newId();
data.users.push({
  _id: adminId,
  name: 'Admin Test',
  email: 'admin_test@gmail.com',
  password: 'will_be_hashed',
  role: 'admin'
});

const managerId = newId();
data.users.push({
  _id: managerId,
  name: 'Manager Test',
  email: 'manager_test@gmail.com',
  password: 'will_be_hashed',
  role: 'manager'
});

// 2 Teachers
const teacher1Id = newId();
const tProf1Id = newId();
data.users.push({
  _id: teacher1Id,
  name: 'Teacher Test 1',
  email: 'teacher_test1@gmail.com',
  password: 'will_be_hashed',
  role: 'teacher'
});
data.teacherProfiles.push({
  _id: tProf1Id,
  userId: teacher1Id,
  specialization: ['Math'],
  experienceYears: 3,
  bio: 'Test bio',
  phoneNumber: '0900000001'
});

const teacher2Id = newId();
const tProf2Id = newId();
data.users.push({
  _id: teacher2Id,
  name: 'Teacher Test 2',
  email: 'teacher_test2@gmail.com',
  password: 'will_be_hashed',
  role: 'teacher'
});
data.teacherProfiles.push({
  _id: tProf2Id,
  userId: teacher2Id,
  specialization: ['Physics'],
  experienceYears: 4,
  bio: 'Test bio 2',
  phoneNumber: '0900000002'
});

// 5 Subjects
const subjectIds = Array.from({length: 5}, () => newId());
for (let i = 0; i < 5; i++) {
  data.subjects.push({
    _id: subjectIds[i],
    name: `Test Subject ${i + 1}`,
    description: `Desc ${i + 1}`,
    gradeLevel: '10',
    defaultTuitionFee: 500000,
    status: 'active'
  });
}

// 5 Classes (3 for Teacher 1, 2 for Teacher 2)
const classIds = Array.from({length: 5}, () => newId());
for (let i = 0; i < 5; i++) {
  data.classes.push({
    _id: classIds[i],
    name: `Test Class ${i + 1}`,
    subjectId: subjectIds[i],
    teacherId: i < 3 ? tProf1Id : tProf2Id,
    room: `Room ${i + 1}`,
    maxStudents: 20,
    startDate: new Date('2024-01-01').toISOString(),
    endDate: new Date('2024-12-31').toISOString(),
    status: 'ongoing'
  });
}

// Parents (Each parent has 2 kids)
let studentCounter = 1;
let parentCounter = 1;
// 15 students per class * 5 classes = 75 students
for (let cIdx = 0; cIdx < 5; cIdx++) {
  const classId = classIds[cIdx];
  for (let sIdx = 0; sIdx < 15; sIdx++) {
    const studentId = newId();
    const sProfId = newId();
    
    data.users.push({
      _id: studentId,
      name: `Student Test ${studentCounter}`,
      email: `student_test_${studentCounter}@gmail.com`,
      password: 'will_be_hashed',
      role: 'student'
    });

    const parentName = `Parent Test ${parentCounter}`;
    const parentPhone = `091000${parentCounter.toString().padStart(4, '0')}`;
    
    data.studentProfiles.push({
      _id: sProfId,
      userId: studentId,
      parentName: parentName,
      parentPhone: parentPhone,
      grade: '10',
      school: 'Test School'
    });

    data.classStudents.push({
      _id: newId(),
      classId: classId,
      studentId: sProfId,
      status: 'enrolled'
    });

    studentCounter++;
    if (studentCounter % 2 === 1) parentCounter++; // Every 2 students share 1 parent
  }
}

// Schedules - ensure no overlap for teacher and room
// Slots: Ca 1, Ca 2, Ca 3, Ca 4, Ca 5
const slots = [
  { startTime: '07:30', endTime: '09:30' },
  { startTime: '09:30', endTime: '11:30' },
  { startTime: '14:00', endTime: '16:00' },
  { startTime: '16:00', endTime: '18:00' },
  { startTime: '18:00', endTime: '20:00' }
];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Class 1: Teacher 1, Mon Ca 1, Wed Ca 1
data.schedules.push({ _id: newId(), classId: classIds[0], teacherId: tProf1Id, dayOfWeek: 'Monday', startTime: slots[0].startTime, endTime: slots[0].endTime, room: 'Room 1', status: 'active' });
data.schedules.push({ _id: newId(), classId: classIds[0], teacherId: tProf1Id, dayOfWeek: 'Wednesday', startTime: slots[0].startTime, endTime: slots[0].endTime, room: 'Room 1', status: 'active' });

// Class 2: Teacher 1, Tue Ca 2, Thu Ca 2
data.schedules.push({ _id: newId(), classId: classIds[1], teacherId: tProf1Id, dayOfWeek: 'Tuesday', startTime: slots[1].startTime, endTime: slots[1].endTime, room: 'Room 2', status: 'active' });
data.schedules.push({ _id: newId(), classId: classIds[1], teacherId: tProf1Id, dayOfWeek: 'Thursday', startTime: slots[1].startTime, endTime: slots[1].endTime, room: 'Room 2', status: 'active' });

// Class 3: Teacher 1, Mon Ca 3, Wed Ca 3
data.schedules.push({ _id: newId(), classId: classIds[2], teacherId: tProf1Id, dayOfWeek: 'Monday', startTime: slots[2].startTime, endTime: slots[2].endTime, room: 'Room 3', status: 'active' });
data.schedules.push({ _id: newId(), classId: classIds[2], teacherId: tProf1Id, dayOfWeek: 'Wednesday', startTime: slots[2].startTime, endTime: slots[2].endTime, room: 'Room 3', status: 'active' });

// Class 4: Teacher 2, Mon Ca 1, Wed Ca 1 (Diff room, Diff teacher, same slot as Class 1 - no overlap)
data.schedules.push({ _id: newId(), classId: classIds[3], teacherId: tProf2Id, dayOfWeek: 'Monday', startTime: slots[0].startTime, endTime: slots[0].endTime, room: 'Room 4', status: 'active' });
data.schedules.push({ _id: newId(), classId: classIds[3], teacherId: tProf2Id, dayOfWeek: 'Wednesday', startTime: slots[0].startTime, endTime: slots[0].endTime, room: 'Room 4', status: 'active' });

// Class 5: Teacher 2, Tue Ca 2, Thu Ca 2
data.schedules.push({ _id: newId(), classId: classIds[4], teacherId: tProf2Id, dayOfWeek: 'Tuesday', startTime: slots[1].startTime, endTime: slots[1].endTime, room: 'Room 5', status: 'active' });
data.schedules.push({ _id: newId(), classId: classIds[4], teacherId: tProf2Id, dayOfWeek: 'Thursday', startTime: slots[1].startTime, endTime: slots[1].endTime, room: 'Room 5', status: 'active' });

// Sessions & Attendance for Class 1 (Teacher 1)
const sessionId = newId();
data.sessions.push({
  _id: sessionId,
  classId: classIds[0],
  scheduleId: data.schedules[0]._id, // Mon Ca 1
  sessionDate: new Date('2026-06-15').toISOString(), // A Monday
  topic: 'Test Topic',
  status: 'COMPLETED'
});

// Add attendance for all 15 students in Class 1
const class1Students = data.classStudents.filter(cs => cs.classId === classIds[0]);
class1Students.forEach((cs, i) => {
  data.attendances.push({
    _id: newId(),
    sessionId: sessionId,
    studentId: cs.studentId,
    status: i < 13 ? 'PRESENT' : 'ABSENT', // First 13 present, 2 absent
    note: i >= 13 ? 'Sick' : ''
  });
});

fs.writeFileSync(path.join(__dirname, 'test-data.json'), JSON.stringify(data, null, 2));
console.log('test-data.json generated successfully!');
