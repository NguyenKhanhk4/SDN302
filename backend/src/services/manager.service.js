const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const TeacherProfile = require('../models/TeacherProfile');
const ParentProfile = require('../models/ParentProfile');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const Schedule = require('../models/Schedule');
const Invoice = require('../models/Invoice');

const buildSearchFilter = (search, fields) => {
  if (!search) return {};
  const searchRegex = new RegExp(search, 'i');
  return {
    $or: fields.map(field => ({ [field]: searchRegex }))
  };
};

const createStudentUserAndProfile = async (data) => {
  const { fullName, email, phone, parentId, dateOfBirth, gender, address } = data;
  
  const user = new User({
    name: fullName,
    email,
    phone,
    role: 'student',
    password: 'password123', // Default password
    isActive: true
  });
  await user.save();

  const profile = new StudentProfile({
    userId: user._id,
    parentId,
    dateOfBirth,
    gender,
    address,
    status: 'active'
  });
  await profile.save();

  return profile;
};

const createParentUserAndProfile = async (data) => {
  const { fullName, email, phone, address, occupation } = data;
  
  const user = new User({
    name: fullName,
    email,
    phone,
    role: 'parent',
    password: 'password123',
    isActive: true
  });
  await user.save();

  const profile = new ParentProfile({
    userId: user._id,
    address,
    occupation
  });
  await profile.save();

  return profile;
};

const createTeacherUserAndProfile = async (data) => {
  const { fullName, email, phone, experienceYears, specialization } = data;
  
  const user = new User({
    name: fullName,
    email,
    phone,
    role: 'teacher',
    password: 'password123',
    isActive: true
  });
  await user.save();

  const profile = new TeacherProfile({
    userId: user._id,
    experienceYears: experienceYears || 0,
    specialization: specialization || [],
    status: 'active'
  });
  await profile.save();

  return profile;
};

const checkTeacherExists = async (teacherId) => {
  const teacher = await TeacherProfile.findById(teacherId);
  if (!teacher) throw new Error('Teacher not found');
  return teacher;
};

const checkStudentExists = async (studentId) => {
  const student = await StudentProfile.findById(studentId);
  if (!student) throw new Error('Student not found');
  return student;
};

const checkClassExists = async (classId) => {
  const classObj = await Class.findById(classId);
  if (!classObj) throw new Error('Class not found');
  return classObj;
};

const checkSubjectExists = async (subjectId) => {
  const subject = await Subject.findById(subjectId);
  if (!subject) throw new Error('Subject not found');
  return subject;
};

const checkScheduleConflict = async (teacherId, dayOfWeek, startTime, endTime) => {
  const conflicts = await Schedule.find({
    teacherId,
    dayOfWeek,
    status: 'active',
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
    ]
  });
  
  if (conflicts.length > 0) {
    throw new Error('Giáo viên bị trùng lịch giảng dạy');
  }
};

const calculateInvoiceSummary = async () => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const totalInvoices = await Invoice.countDocuments();
  const paidInvoices = await Invoice.countDocuments({ status: 'paid' });
  const unpaidInvoices = await Invoice.countDocuments({ status: 'unpaid' });

  const monthlyRevenueData = await Invoice.aggregate([
    {
      $match: {
        status: 'paid',
        paidAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);

  const monthlyRevenue = monthlyRevenueData.length > 0 ? monthlyRevenueData[0].total : 0;

  return {
    totalInvoices,
    paidInvoices,
    unpaidInvoices,
    monthlyRevenue
  };
};

module.exports = {
  buildSearchFilter,
  createStudentUserAndProfile,
  createParentUserAndProfile,
  createTeacherUserAndProfile,
  checkTeacherExists,
  checkStudentExists,
  checkClassExists,
  checkSubjectExists,
  checkScheduleConflict,
  calculateInvoiceSummary
};
