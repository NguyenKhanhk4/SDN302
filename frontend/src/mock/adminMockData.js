// Mock data for Admin Frontend
export const mockUsers = [
  {
    _id: "u1",
    fullName: "Nguyen Van Teacher",
    email: "teacher@gmail.com",
    phone: "0901234567",
    role: "TEACHER",
    status: "ACTIVE",
    createdAt: "2026-01-10T08:00:00.000Z"
  },
  {
    _id: "u2",
    fullName: "Tran Thi Student",
    email: "student@gmail.com",
    phone: "0912345678",
    role: "STUDENT",
    status: "ACTIVE",
    createdAt: "2026-02-15T09:30:00.000Z"
  },
  {
    _id: "u3",
    fullName: "Le Van Student2",
    email: "student2@gmail.com",
    phone: "0923456789",
    role: "STUDENT",
    status: "ACTIVE",
    createdAt: "2026-03-01T10:15:00.000Z"
  },
  {
    _id: "u4",
    fullName: "Pham Thi Student3",
    email: "student3@gmail.com",
    phone: "0934567890",
    role: "STUDENT",
    status: "INACTIVE",
    createdAt: "2026-03-10T14:20:00.000Z"
  },
  {
    _id: "u5",
    fullName: "Hoang Van Parent",
    email: "parent@gmail.com",
    phone: "0945678901",
    role: "PARENT",
    status: "ACTIVE",
    createdAt: "2026-02-20T11:00:00.000Z"
  },
  {
    _id: "u6",
    fullName: "Nguyen Thi Manager",
    email: "manager@gmail.com",
    phone: "0956789012",
    role: "MANAGER",
    status: "ACTIVE",
    createdAt: "2026-01-05T08:00:00.000Z"
  },
  {
    _id: "u7",
    fullName: "Banned User Test",
    email: "banned@gmail.com",
    phone: "0999999999",
    role: "STUDENT",
    status: "BANNED",
    createdAt: "2026-04-01T16:00:00.000Z"
  }
];

export const mockSubjects = [
  {
    _id: "s1",
    name: "Toan Nang Cao",
    description: "Mon Toan nang cao danh cho hoc sinh THPT",
    gradeLevel: "THPT",
    status: "ACTIVE"
  },
  {
    _id: "s2",
    name: "Vat Ly Co Ban",
    description: "Mon Vat ly co ban",
    gradeLevel: "THCS",
    status: "ACTIVE"
  },
  {
    _id: "s3",
    name: "Tieng Anh Giao Tiep",
    description: "Tieng Anh giao tiep thuc te",
    gradeLevel: "All",
    status: "ACTIVE"
  }
];

export const mockClasses = [
  {
    _id: "c1",
    name: "Lop Toan 10A",
    subject: "Toan Nang Cao",
    teacher: "Nguyen Van Teacher",
    room: "Phong B201",
    maxStudents: 15,
    currentStudents: 2,
    startDate: "2026-09-01",
    endDate: "2027-05-31",
    status: "ACTIVE"
  },
  {
    _id: "c2",
    name: "Lop Ly 9B",
    subject: "Vat Ly Co Ban",
    teacher: "Nguyen Van Teacher",
    room: "Phong A102",
    maxStudents: 20,
    currentStudents: 1,
    startDate: "2026-10-01",
    endDate: "2027-06-30",
    status: "UPCOMING"
  },
  {
    _id: "c3",
    name: "Lop Anh 101",
    subject: "Tieng Anh Giao Tiep",
    teacher: "Nguyen Van Teacher",
    room: "Phong Online 1",
    maxStudents: 10,
    currentStudents: 0,
    startDate: "2025-09-01",
    endDate: "2026-05-31",
    status: "FINISHED"
  },
  {
    _id: "c4",
    name: "Lop Toan Demo Huy",
    subject: "Toan Nang Cao",
    teacher: "Nguyen Van Teacher",
    room: "Phong B202",
    maxStudents: 15,
    currentStudents: 0,
    startDate: "2026-01-01",
    endDate: "2026-03-31",
    status: "CANCELLED"
  }
];

export const mockClassStudents = [
  {
    classId: "c1",
    students: [
      {
        _id: "cs1",
        studentName: "Tran Thi Student",
        email: "student@gmail.com",
        phone: "0912345678",
        status: "ACTIVE"
      },
      {
        _id: "cs2",
        studentName: "Le Van Student2",
        email: "student2@gmail.com",
        phone: "0923456789",
        status: "ACTIVE"
      }
    ]
  },
  {
    classId: "c2",
    students: [
      {
        _id: "cs3",
        studentName: "Le Van Student2",
        email: "student2@gmail.com",
        phone: "0923456789",
        status: "ACTIVE"
      }
    ]
  },
  {
    classId: "c3",
    students: []
  },
  {
    classId: "c4",
    students: []
  }
];

export const mockSchedules = [
  {
    _id: "sch1",
    class: "Lop Toan 10A",
    teacher: "Nguyen Van Teacher",
    dayOfWeek: "1", // Monday
    startTime: "08:00",
    endTime: "10:00",
    room: "Phong B201",
    status: "ACTIVE"
  },
  {
    _id: "sch2",
    class: "Lop Toan 10A",
    teacher: "Nguyen Van Teacher",
    dayOfWeek: "3", // Wednesday
    startTime: "08:00",
    endTime: "10:00",
    room: "Phong B201",
    status: "ACTIVE"
  },
  {
    _id: "sch3",
    class: "Lop Ly 9B",
    teacher: "Nguyen Van Teacher",
    dayOfWeek: "2", // Tuesday
    startTime: "14:00",
    endTime: "16:00",
    room: "Phong A102",
    status: "ACTIVE"
  },
  {
    _id: "sch4",
    class: "Lop Anh 101",
    teacher: "Nguyen Van Teacher",
    dayOfWeek: "5", // Friday
    startTime: "19:00",
    endTime: "21:00",
    room: "Phong Online 1",
    status: "CANCELLED"
  }
];
