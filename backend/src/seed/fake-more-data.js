require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');

// Models
const User = require('../models/User');
const TeacherProfile = require('../models/TeacherProfile');
const StudentProfile = require('../models/StudentProfile');
const ParentProfile = require('../models/ParentProfile');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const ClassStudent = require('../models/ClassStudent');
const Schedule = require('../models/Schedule');
const Grade = require('../models/Grade');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sdn302_db';

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');

    // 1. Tạo danh sách 6 Giáo viên khác nhau (Mỗi người dạy đúng 1 lớp)
    const teachersData = [
      {
        name: 'Nguyen Van Math',
        email: 'teacher@gmail.com',
        specialization: ['Toán học'],
        experience: 8,
        bio: 'Chuyên gia giảng dạy môn Toán cấp THPT với nhiều phương pháp tư duy sáng tạo.',
        phone: '0901234561'
      },
      {
        name: 'Tran Thi Hoa (Chemistry)',
        email: 'hoa.tran@gmail.com',
        specialization: ['Hóa học'],
        experience: 6,
        bio: 'Giáo viên Hóa học nhiệt huyết, chuyên luyện thi học sinh giỏi.',
        phone: '0901234562'
      },
      {
        name: 'Le Van Ly (Physics)',
        email: 'ly.le@gmail.com',
        specialization: ['Vật lý'],
        experience: 5,
        bio: 'Phương pháp dạy Vật lý trực quan, sinh động giúp học sinh nắm vững bản chất.',
        phone: '0901234563'
      },
      {
        name: 'Pham Thi Anh (English 11)',
        email: 'anh.pham@gmail.com',
        specialization: ['Tiếng Anh'],
        experience: 7,
        bio: 'Nhiều năm kinh nghiệm ôn luyện chứng chỉ tiếng Anh quốc tế và giao tiếp.',
        phone: '0901234564'
      },
      {
        name: 'Vu Van English (English 12)',
        email: 'english.vu@gmail.com',
        specialization: ['Tiếng Anh'],
        experience: 10,
        bio: 'Tập trung luyện thi tốt nghiệp THPT Quốc gia và phát triển phản xạ giao tiếp.',
        phone: '0901234565'
      },
      {
        name: 'Hoang Van Toan (Math 12)',
        email: 'toan.hoang@gmail.com',
        specialization: ['Toán học'],
        experience: 12,
        bio: 'Kinh nghiệm luyện đề thi đại học môn Toán, tác giả của nhiều đầu sách tham khảo.',
        phone: '0901234566'
      }
    ];

    const teacherProfilesMap = {};

    for (const t of teachersData) {
      let u = await User.findOne({ email: t.email });
      if (!u) {
        u = await User.create({
          name: t.name,
          email: t.email,
          password: '123456',
          role: 'teacher',
        });
        console.log(`Created User Teacher: ${t.email}`);
      } else {
        u.name = t.name;
        await u.save();
      }

      let p = await TeacherProfile.findOne({ userId: u._id });
      if (!p) {
        p = await TeacherProfile.create({
          userId: u._id,
          specialization: t.specialization,
          experienceYears: t.experience,
          bio: t.bio,
          phoneNumber: t.phone,
        });
        console.log(`Created TeacherProfile for: ${t.email}`);
      } else {
        p.specialization = t.specialization;
        p.experienceYears = t.experience;
        p.bio = t.bio;
        p.phoneNumber = t.phone;
        await p.save();
      }
      teacherProfilesMap[t.email] = p;
    }

    // 2. Tìm hoặc tạo Phụ huynh mẫu
    let parentUser = await User.findOne({ email: 'parent@gmail.com' });
    if (!parentUser) {
      parentUser = await User.create({
        name: 'Nguyen Van Bo (Parent)',
        email: 'parent@gmail.com',
        password: '123456',
        role: 'parent',
      });
    }
    let parentProfile = await ParentProfile.findOne({ userId: parentUser._id });
    if (!parentProfile) {
      parentProfile = await ParentProfile.create({
        userId: parentUser._id,
        phoneNumber: '0912345678',
        children: [],
      });
    }

    // 3. Khởi tạo danh sách các con của phụ huynh này
    const parentChildrenData = [
      {
        name: 'Tran Thi Student',
        email: 'student@gmail.com',
        grade: '10',
        school: 'THPT Nguyen Trai',
        classes: [
          {
            subjectName: 'Toan Nang Cao',
            className: 'Lop Toan 10A',
            room: 'Phong B201',
            fee: 800000,
            teacherEmail: 'teacher@gmail.com',
            schedules: [
              { day: 'Monday', start: '08:00', end: '10:00' },
              { day: 'Wednesday', start: '08:00', end: '10:00' }
            ],
            grades: [
              { type: 'Giua ky', score: 8.5, remarks: 'Hoc bai tot, lam bai thi tot.' },
              { type: 'Cuoi ky', score: 9.0, remarks: 'Tiep thu nhanh, lam bai xuat sac.' }
            ]
          },
          {
            subjectName: 'Hoa Hoc Co Ban',
            className: 'Lop Hoa 10B',
            room: 'Phong B202',
            fee: 780000,
            teacherEmail: 'hoa.tran@gmail.com',
            schedules: [
              { day: 'Tuesday', start: '08:00', end: '10:00' },
              { day: 'Thursday', start: '08:00', end: '10:00' }
            ],
            grades: [
              { type: 'Giua ky', score: 7.8, remarks: 'Chăm chú nghe giảng.' },
              { type: 'Cuoi ky', score: 8.2, remarks: 'Thực hành Hóa tốt.' }
            ]
          }
        ]
      },
      {
        name: 'Nguyen Van Son',
        email: 'son.nguyen@gmail.com',
        grade: '11',
        school: 'THPT Chu Van An',
        classes: [
          {
            subjectName: 'Vat Ly Nang Cao',
            className: 'Lop Ly 11B',
            room: 'Phong A102',
            fee: 750000,
            teacherEmail: 'ly.le@gmail.com',
            schedules: [
              { day: 'Thursday', start: '14:00', end: '16:00' },
              { day: 'Saturday', start: '14:00', end: '16:00' }
            ],
            grades: [
              { type: 'Giua ky', score: 8.0, remarks: 'Nắm chắc kiến thức cơ bản.' },
              { type: 'Cuoi ky', score: 8.5, remarks: 'Có tinh thần tự học cao.' }
            ]
          },
          {
            subjectName: 'Tieng Anh Nang Cao',
            className: 'Lop Anh 11C',
            room: 'Phong C103',
            fee: 850000,
            teacherEmail: 'anh.pham@gmail.com',
            schedules: [
              { day: 'Wednesday', start: '14:00', end: '16:00' },
              { day: 'Friday', start: '14:00', end: '16:00' }
            ],
            grades: [
              { type: 'Giua ky', score: 9.0, remarks: 'Từ vựng rất tốt.' },
              { type: 'Cuoi ky', score: 9.5, remarks: 'Phát âm chuẩn xác.' }
            ]
          }
        ]
      },
      {
        name: 'Nguyen Thi Lan',
        email: 'lan.nguyen@gmail.com',
        grade: '12',
        school: 'THPT Kim Lien',
        classes: [
          {
            subjectName: 'Tieng Anh Giao Tiep',
            className: 'Lop Anh 12C',
            room: 'Phong C303',
            fee: 900000,
            teacherEmail: 'english.vu@gmail.com',
            schedules: [
              { day: 'Tuesday', start: '18:00', end: '20:00' },
              { day: 'Friday', start: '18:00', end: '20:00' }
            ],
            grades: [
              { type: 'Giua ky', score: 7.5, remarks: 'Kỹ năng nghe nói tốt, cần luyện thêm viết.' },
              { type: 'Cuoi ky', score: 9.2, remarks: 'Tiến bộ vượt bậc, phát âm chuẩn.' }
            ]
          },
          {
            subjectName: 'Toan Luyen Thi',
            className: 'Lop Toan 12A',
            room: 'Phong B301',
            fee: 950000,
            teacherEmail: 'toan.hoang@gmail.com',
            schedules: [
              { day: 'Monday', start: '18:00', end: '20:00' },
              { day: 'Thursday', start: '18:00', end: '20:00' }
            ],
            grades: [
              { type: 'Giua ky', score: 8.2, remarks: 'Giải toán nhanh.' },
              { type: 'Cuoi ky', score: 8.8, remarks: 'Logic tốt.' }
            ]
          }
        ]
      }
    ];

    const childrenIds = [];
    const createdClasses = {};

    for (const cData of parentChildrenData) {
      // 3.1. Tạo học sinh
      let student = await User.findOne({ email: cData.email });
      if (!student) {
        student = await User.create({
          name: cData.name,
          email: cData.email,
          password: '123456',
          role: 'student',
        });
      }
      childrenIds.push(student._id);

      // 3.2. Tạo StudentProfile
      let profile = await StudentProfile.findOne({ userId: student._id });
      if (!profile) {
        profile = await StudentProfile.create({
          userId: student._id,
          parentName: parentUser.name,
          parentPhone: parentProfile.phoneNumber,
          grade: cData.grade,
          school: cData.school,
        });
      }

      for (const cls of cData.classes) {
        // 3.3. Tạo Môn học
        let subject = await Subject.findOne({ name: cls.subjectName });
        if (!subject) {
          subject = await Subject.create({
            name: cls.subjectName,
            description: `Khóa học chuyên sâu ${cls.subjectName} chuẩn chất lượng cao.`,
            gradeLevel: cData.grade,
            defaultTuitionFee: cls.fee,
            status: 'active',
          });
        }

        // Lấy giáo viên tương ứng lớp này
        const teacherProf = teacherProfilesMap[cls.teacherEmail];

        // 3.4. Tạo Lớp học hoặc cập nhật giáo viên dạy
        let classroom = await Class.findOne({ name: cls.className });
        if (!classroom) {
          classroom = await Class.create({
            name: cls.className,
            subjectId: subject._id,
            teacherId: teacherProf._id,
            room: cls.room,
            maxStudents: 20,
            startDate: new Date('2024-09-01'),
            endDate: new Date('2025-05-31'),
            status: 'ongoing',
          });
        } else {
          classroom.teacherId = teacherProf._id;
          await classroom.save();
        }
        createdClasses[cls.className] = classroom;

        // 3.5. Enroll học sinh vào lớp
        let enrollment = await ClassStudent.findOne({ classId: classroom._id, studentId: profile._id });
        if (!enrollment) {
          enrollment = await ClassStudent.create({
            classId: classroom._id,
            studentId: profile._id,
            status: 'enrolled',
          });
        }

        // 3.6. Tạo Lịch học hoặc cập nhật giáo viên dạy lịch học đó
        for (const sched of cls.schedules) {
          let schedule = await Schedule.findOne({
            classId: classroom._id,
            dayOfWeek: sched.day,
          });
          if (!schedule) {
            await Schedule.create({
              classId: classroom._id,
              teacherId: teacherProf._id,
              dayOfWeek: sched.day,
              startTime: sched.start,
              endTime: sched.end,
              room: cls.room,
              status: 'active',
            });
          } else {
            schedule.teacherId = teacherProf._id;
            await schedule.save();
          }
        }

        // 3.7. Tạo Điểm số
        for (const gr of cls.grades) {
          let grade = await Grade.findOne({
            studentId: student._id,
            classId: classroom._id,
            gradeType: gr.type,
          });
          if (!grade) {
            await Grade.create({
              studentId: student._id,
              classId: classroom._id,
              gradeType: gr.type,
              score: gr.score,
              remarks: gr.remarks,
            });
          }
        }
      }
    }

    // 4. Tạo thêm 4 học viên khác học chung các lớp để danh sách học viên trông đầy đặn
    const extraStudents = [
      { name: 'Le Thi Hoa', email: 'hoa.le@gmail.com', grade: '10', school: 'THPT Kim Lien' },
      { name: 'Tran Van Binh', email: 'binh.tran@gmail.com', grade: '11', school: 'THPT Chu Van An' },
      { name: 'Pham Minh Duc', email: 'duc.pham@gmail.com', grade: '12', school: 'THPT Tran Phu' },
      { name: 'Hoang Ngoc Diep', email: 'diep.hoang@gmail.com', grade: '10', school: 'THPT Nguyen Trai' }
    ];

    for (const ex of extraStudents) {
      let exUser = await User.findOne({ email: ex.email });
      if (!exUser) {
        exUser = await User.create({
          name: ex.name,
          email: ex.email,
          password: '123456',
          role: 'student',
        });
      }

      let exProfile = await StudentProfile.findOne({ userId: exUser._id });
      if (!exProfile) {
        exProfile = await StudentProfile.create({
          userId: exUser._id,
          parentName: 'Phu huynh ' + ex.name,
          parentPhone: '0987654321',
          grade: ex.grade,
          school: ex.school,
        });
      }

      // Enroll học viên phụ vào các lớp tương ứng khối học
      for (const className of Object.keys(createdClasses)) {
        const cls = createdClasses[className];
        const isClassForGrade = (className.includes('10') && ex.grade === '10') ||
                              (className.includes('11') && ex.grade === '11') ||
                              (className.includes('12') && ex.grade === '12');

        if (isClassForGrade) {
          let enrollment = await ClassStudent.findOne({ classId: cls._id, studentId: exProfile._id });
          if (!enrollment) {
            await ClassStudent.create({
              classId: cls._id,
              studentId: exProfile._id,
              status: 'enrolled',
            });
            console.log(`Enrolled extra student ${ex.name} in class ${className}`);
          }
        }
      }
    }

    // 5. Liên kết các con vào ParentProfile
    parentProfile.children = childrenIds;
    await parentProfile.save();
    console.log(`\n✅ Database updated: Each of the 6 classes now has a unique teacher assigned!`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

run();
