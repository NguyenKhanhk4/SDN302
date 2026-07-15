require('dotenv').config({ path: __dirname + '/../../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const TeacherProfile = require('../models/TeacherProfile');
const ParentProfile = require('../models/ParentProfile');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const ClassStudent = require('../models/ClassStudent');
const Schedule = require('../models/Schedule');
const ParentStudent = require('../models/ParentStudent');

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sdn302_db';

const firstNames = ['An', 'Bình', 'Châu', 'Dũng', 'Dương', 'Hà', 'Hải', 'Hoàng', 'Hưng', 'Kiên', 'Linh', 'Minh', 'Ngọc', 'Nhi', 'Phương', 'Quân', 'Sơn', 'Tâm', 'Thảo', 'Trang', 'Tú', 'Tuấn'];
const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];

const getRandomName = () => `${lastNames[Math.floor(Math.random() * lastNames.length)]} ${firstNames[Math.floor(Math.random() * firstNames.length)]}`;
const getRandomPhone = () => `0${Math.floor(Math.random() * 900000000 + 100000000)}`;

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    console.log('Clearing old data...');
    await User.deleteMany({});
    await StudentProfile.deleteMany({});
    await TeacherProfile.deleteMany({});
    await ParentProfile.deleteMany({});
    await Subject.deleteMany({});
    await Class.deleteMany({});
    await ClassStudent.deleteMany({});
    await ClassStudent.deleteMany({});
    await Schedule.deleteMany({});
    await ParentStudent.deleteMany({});
    console.log('Old data cleared.');

    // 1. Create Users
    console.log('Creating users...');
    
    // Admin & Manager
    const admin = await User.create({ name: 'Admin', email: 'admin@compass.edu.vn', password: 'password123', role: 'admin' });
    const manager = await User.create({ name: 'Manager 1', email: 'manager@compass.edu.vn', password: 'password123', role: 'manager' });
    
    // Teachers
    const teachers = [];
    for (let i = 1; i <= 20; i++) {
      const user = await User.create({
        name: `Giáo viên ${getRandomName()}`,
        email: `teacher${i}@compass.edu.vn`,
        password: 'password123',
        role: 'teacher',
        phone: getRandomPhone(),
      });
      const profile = await TeacherProfile.create({
        userId: user._id,
        specialization: i % 2 === 0 ? 'Toán học' : 'Vật lý',
        experienceYears: Math.floor(Math.random() * 10) + 1,
        degree: 'Cử nhân Sư phạm',
      });
      teachers.push({ user, profile });
    }

    // Parents
    const parents = [];
    for (let i = 1; i <= 20; i++) {
      const user = await User.create({
        name: `Phụ huynh ${getRandomName()}`,
        email: `parent${i}@compass.edu.vn`,
        password: 'password123',
        role: 'parent',
        phone: getRandomPhone(),
      });
      const profile = await ParentProfile.create({
        userId: user._id,
        occupation: 'Nhân viên văn phòng',
      });
      parents.push({ user, profile });
    }

    // Students
    const students = [];
    for (let i = 1; i <= 20; i++) {
      const parent = parents[Math.floor(Math.random() * parents.length)];
      const user = await User.create({
        name: `Học sinh ${getRandomName()}`,
        email: `student${i}@compass.edu.vn`,
        password: 'password123',
        role: 'student',
        phone: getRandomPhone(),
      });
      const profile = await StudentProfile.create({
        userId: user._id,
        school: `THPT Số ${Math.floor(Math.random() * 5) + 1}`,
        grade: Math.floor(Math.random() * 3) + 10,
        parentPhone: parent.user.phone,
        status: 'active',
      });
      students.push({ user, profile });

      // Link Parent and Student
      await ParentStudent.create({
        parentId: parent.profile._id,
        studentId: profile._id,
        relationship: 'father' // Default relationship
      });
    }

    // 2. Create Subjects
    console.log('Creating subjects...');
    const subjectNames = ['Toán Cơ bản 10', 'Toán Nâng cao 11', 'Vật lý 12', 'Hóa học 10', 'Tiếng Anh Giao tiếp', 'IELTS 6.5', 'Ngữ Văn 12', 'Sinh học Cơ bản', 'Lịch sử Căn bản', 'Tin học Lập trình'];
    const subjects = [];
    for (let i = 0; i < subjectNames.length; i++) {
      const subject = await Subject.create({
        name: subjectNames[i],
        code: `SUBJ${i + 1}`,
        description: `Mô tả cho ${subjectNames[i]}`,
        status: 'active',
      });
      subjects.push(subject);
    }

    // 3. Create Classes
    console.log('Creating classes...');
    const classes = [];
    for (let i = 1; i <= 20; i++) {
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const teacher = teachers[Math.floor(Math.random() * teachers.length)];
      const cls = await Class.create({
        name: `Lớp ${subject.name} - 0${i}`,
        subjectId: subject._id,
        teacherId: teacher.profile._id, // Must be TeacherProfile ID
        startDate: new Date(),
        endDate: new Date(new Date().getTime() + 90 * 24 * 60 * 60 * 1000), 
        room: `Phòng ${Math.floor(Math.random() * 100) + 101}`,
        tuitionFee: 1500000,
        maxStudents: 20,
        status: 'ongoing', // Valid enum: scheduled, ongoing, completed, cancelled
      });
      classes.push(cls);
    }

    // 4. Assign Students to Classes
    console.log('Assigning students to classes...');
    for (const student of students) {
      const numClasses = Math.floor(Math.random() * 3) + 1;
      const shuffledClasses = [...classes].sort(() => 0.5 - Math.random());
      for (let i = 0; i < numClasses; i++) {
        await ClassStudent.create({
          classId: shuffledClasses[i]._id,
          studentId: student.profile._id, 
          status: 'enrolled',
        });
      }
    }

    // 5. Create Schedules
    console.log('Creating schedules...');
    for (const cls of classes) {
      const days = ['1', '3', '5']; // Mon, Wed, Fri
      for (const day of days) {
        await Schedule.create({
          classId: cls._id,
          teacherId: cls.teacherId,
          dayOfWeek: day,
          startTime: '18:00',
          endTime: '19:30',
          room: cls.room,
          status: 'active'
        });
      }
    }

    console.log('----------------------------------------------------');
    console.log('Seed completed successfully!');
    console.log(`- 2 Admins/Managers`);
    console.log(`- 20 Teachers`);
    console.log(`- 20 Parents`);
    console.log(`- 20 Students (Mỗi học viên đều được liên kết với 1 phụ huynh)`);
    console.log(`- ${subjects.length} Subjects`);
    console.log(`- ${classes.length} Classes`);
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
