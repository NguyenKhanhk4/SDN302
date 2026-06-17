const Class = require('../models/Class');
const Schedule = require('../models/Schedule');
const ClassStudent = require('../models/ClassStudent');

// Phai require cac model duoc dung trong populate()
// de Mongoose dang ky schema truoc khi query
require('../models/Subject');
require('../models/TeacherProfile');
require('../models/StudentProfile');

const {
  getTeacherProfileByUserId,
  checkTeacherOwnsClass,
  getActiveStudentsInClass,
} = require('../services/teacher.service');


// ============================================================
// @desc    Lay dashboard tong quan cua Teacher
// @route   GET /api/teacher/dashboard
// @access  Private (Teacher)
// ============================================================
const getTeacherDashboard = async (req, res) => {
  try {
    const teacherProfile = await getTeacherProfileByUserId(req.user._id);

    // Tong so lop dang day
    const totalClasses = await Class.countDocuments({
      teacherId: teacherProfile._id,
    });

    // Tong so lich day active
    const totalActiveSchedules = await Schedule.countDocuments({
      teacherId: teacherProfile._id,
      status: 'active',
    });

    // Lay tat ca classId cua Teacher
    const myClasses = await Class.find(
      { teacherId: teacherProfile._id },
      '_id'
    );
    const classIds = myClasses.map((c) => c._id);

    // Tong so hoc vien enrolled trong tat ca lop cua Teacher
    const totalStudents = await ClassStudent.countDocuments({
      classId: { $in: classIds },
      status: 'enrolled',
    });

    return res.status(200).json({
      success: true,
      data: {
        totalClasses,
        totalActiveSchedules,
        totalStudents,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// @desc    Teacher xem danh sach lop duoc phan cong
// @route   GET /api/teacher/classes
// @access  Private (Teacher)
// ============================================================
const getMyClasses = async (req, res) => {
  try {
    const teacherProfile = await getTeacherProfileByUserId(req.user._id);

    const classes = await Class.find({ teacherId: teacherProfile._id })
      .populate('subjectId', 'name gradeLevel defaultTuitionFee')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: classes.length,
      data: classes,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// @desc    Teacher xem chi tiet mot lop
// @route   GET /api/teacher/classes/:classId
// @access  Private (Teacher)
// ============================================================
const getMyClassDetail = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherProfile = await getTeacherProfileByUserId(req.user._id);

    // Kiem tra Teacher co quyen xem lop nay khong
    await checkTeacherOwnsClass(teacherProfile._id, classId);

    const classroom = await Class.findById(classId).populate(
      'subjectId',
      'name gradeLevel description defaultTuitionFee'
    );

    return res.status(200).json({
      success: true,
      data: classroom,
    });
  } catch (error) {
    if (error.message === 'You are not assigned to this class') {
      return res.status(403).json({ success: false, message: error.message });
    }
    if (error.message === 'Class not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// @desc    Teacher xem danh sach hoc vien trong mot lop
// @route   GET /api/teacher/classes/:classId/students
// @access  Private (Teacher)
// ============================================================
const getStudentsInMyClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherProfile = await getTeacherProfileByUserId(req.user._id);

    // Kiem tra Teacher co quyen xem lop nay khong
    await checkTeacherOwnsClass(teacherProfile._id, classId);

    const students = await getActiveStudentsInClass(classId);

    return res.status(200).json({
      success: true,
      total: students.length,
      data: students,
    });
  } catch (error) {
    if (error.message === 'You are not assigned to this class') {
      return res.status(403).json({ success: false, message: error.message });
    }
    if (error.message === 'Class not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// @desc    Teacher xem lich day
// @route   GET /api/teacher/schedules
// @access  Private (Teacher)
// ============================================================
const getMySchedules = async (req, res) => {
  try {
    const teacherProfile = await getTeacherProfileByUserId(req.user._id);

    const schedules = await Schedule.find({ teacherId: teacherProfile._id })
      .populate('classId', 'name room status')
      .sort({ dayOfWeek: 1, startTime: 1 });

    return res.status(200).json({
      success: true,
      total: schedules.length,
      data: schedules,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTeacherDashboard,
  getMyClasses,
  getMyClassDetail,
  getStudentsInMyClass,
  getMySchedules,
};
