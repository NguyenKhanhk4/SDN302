const ParentProfile = require('../models/ParentProfile');
const StudentProfile = require('../models/StudentProfile');
const ClassStudent = require('../models/ClassStudent');
const Schedule = require('../models/Schedule');
const Grade = require('../models/Grade');
const Class = require('../models/Class');

// Phải require các model liên quan để Mongoose đăng ký schema trước khi query
require('../models/User');
require('../models/TeacherProfile');
require('../models/Subject');

/**
 * Kiểm tra xem một học sinh (User ID) có phải con của phụ huynh hiện tại không
 * @param {string} parentUserId 
 * @param {string} childUserId 
 * @returns {Promise<boolean>}
 */
const checkIsChildOfParent = async (parentUserId, childUserId) => {
  const parentProfile = await ParentProfile.findOne({ userId: parentUserId });
  if (!parentProfile) return false;
  return parentProfile.children.some(id => id.toString() === childUserId.toString());
};

// ============================================================
// @desc    Lấy danh sách các con liên kết với phụ huynh
// @route   GET /api/parent/children
// @access  Private (Parent)
// ============================================================
const getChildren = async (req, res) => {
  try {
    const parentProfile = await ParentProfile.findOne({ userId: req.user._id });
    if (!parentProfile) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin hồ sơ Phụ huynh',
      });
    }

    // Lấy thông tin StudentProfile của các con
    const studentProfiles = await StudentProfile.find({
      userId: { $in: parentProfile.children },
    }).populate('userId', 'name email');

    return res.status(200).json({
      success: true,
      total: studentProfiles.length,
      data: studentProfiles,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// @desc    Xem lịch học của con cụ thể
// @route   GET /api/parent/children/:childId/schedules
// @access  Private (Parent)
// ============================================================
const getChildSchedules = async (req, res) => {
  try {
    const { childId } = req.params;

    // 1. Kiểm tra xác thực mối quan hệ phụ huynh - con cái
    const isChild = await checkIsChildOfParent(req.user._id, childId);
    if (!isChild) {
      return res.status(403).json({
        success: false,
        message: 'Học sinh này không thuộc danh sách con của bạn hoặc bạn không có quyền truy cập',
      });
    }

    // 2. Tìm hồ sơ học sinh của con
    const studentProfile = await StudentProfile.findOne({ userId: childId });
    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ học sinh của con',
      });
    }

    // 3. Lấy danh sách các lớp con đang học
    const enrollments = await ClassStudent.find({
      studentId: studentProfile._id,
      status: 'enrolled',
    });
    const classIds = enrollments.map(e => e.classId);

    // 4. Lấy lịch học của các lớp đó
    const schedules = await Schedule.find({
      classId: { $in: classIds },
      status: 'active',
    })
      .populate('classId', 'name room status')
      .populate({
        path: 'teacherId',
        populate: {
          path: 'userId',
          select: 'name email',
        },
      })
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

// ============================================================
// @desc    Xem điểm số của con cụ thể
// @route   GET /api/parent/children/:childId/grades
// @access  Private (Parent)
// ============================================================
const getChildGrades = async (req, res) => {
  try {
    const { childId } = req.params;

    // 1. Kiểm tra xác thực mối quan hệ phụ huynh - con cái
    const isChild = await checkIsChildOfParent(req.user._id, childId);
    if (!isChild) {
      return res.status(403).json({
        success: false,
        message: 'Học sinh này không thuộc danh sách con của bạn hoặc bạn không có quyền truy cập',
      });
    }

    // 2. Lấy danh sách điểm số của con
    const grades = await Grade.find({ studentId: childId })
      .populate({
        path: 'classId',
        select: 'name room subjectId',
        populate: {
          path: 'subjectId',
          select: 'name gradeLevel',
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: grades.length,
      data: grades,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// @desc    Xem danh sách giáo viên dạy con cụ thể
// @route   GET /api/parent/children/:childId/teachers
// @access  Private (Parent)
// ============================================================
const getChildTeachers = async (req, res) => {
  try {
    const { childId } = req.params;

    // 1. Kiểm tra xác thực mối quan hệ phụ huynh - con cái
    const isChild = await checkIsChildOfParent(req.user._id, childId);
    if (!isChild) {
      return res.status(403).json({
        success: false,
        message: 'Học sinh này không thuộc danh sách con của bạn hoặc bạn không có quyền truy cập',
      });
    }

    // 2. Tìm hồ sơ học sinh
    const studentProfile = await StudentProfile.findOne({ userId: childId });
    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ học sinh của con',
      });
    }

    // 3. Lấy danh sách lớp con học
    const enrollments = await ClassStudent.find({
      studentId: studentProfile._id,
      status: 'enrolled',
    });
    const classIds = enrollments.map(e => e.classId);

    // 4. Lấy chi tiết lớp học kèm thông tin giáo viên và môn học
    const classes = await Class.find({ _id: { $in: classIds } })
      .populate({
        path: 'teacherId',
        populate: {
          path: 'userId',
          select: 'name email',
        },
      })
      .populate('subjectId', 'name');

    // Gom nhóm danh sách giáo viên duy nhất cùng môn họ dạy con
    const teachersMap = new Map();
    classes.forEach(c => {
      if (c.teacherId) {
        const teacherIdStr = c.teacherId._id.toString();
        const subjectName = c.subjectId ? c.subjectId.name : 'Chưa phân công';
        if (!teachersMap.has(teacherIdStr)) {
          teachersMap.set(teacherIdStr, {
            teacherInfo: {
              _id: c.teacherId._id,
              userId: c.teacherId.userId,
              specialization: c.teacherId.specialization,
              phoneNumber: c.teacherId.phoneNumber,
              experienceYears: c.teacherId.experienceYears,
              bio: c.teacherId.bio,
            },
            classes: [
              {
                classId: c._id,
                className: c.name,
                room: c.room,
                subjectName,
              }
            ]
          });
        } else {
          const existing = teachersMap.get(teacherIdStr);
          existing.classes.push({
            classId: c._id,
            className: c.name,
            room: c.room,
            subjectName,
          });
        }
      }
    });

    const teachersList = Array.from(teachersMap.values());

    return res.status(200).json({
      success: true,
      total: teachersList.length,
      data: teachersList,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// @desc    Xem danh sách lớp học của con cụ thể (tên lớp, phòng học, trạng thái lớp, tên môn học, tên giáo viên)
// @route   GET /api/parent/children/:childId/classes
// @access  Private (Parent)
// ============================================================
const getChildClasses = async (req, res) => {
  try {
    const { childId } = req.params;

    // 1. Kiểm tra xác thực mối quan hệ phụ huynh - con cái
    const isChild = await checkIsChildOfParent(req.user._id, childId);
    if (!isChild) {
      return res.status(403).json({
        success: false,
        message: 'Học sinh này không thuộc danh sách con của bạn hoặc bạn không có quyền truy cập',
      });
    }

    // 2. Tìm hồ sơ học sinh
    const studentProfile = await StudentProfile.findOne({ userId: childId });
    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ học sinh của con',
      });
    }

    // 3. Lấy danh sách lớp con học
    const enrollments = await ClassStudent.find({
      studentId: studentProfile._id,
      status: 'enrolled',
    });
    const classIds = enrollments.map(e => e.classId);

    // 4. Lấy chi tiết lớp học kèm thông tin giáo viên và môn học
    const classes = await Class.find({ _id: { $in: classIds } })
      .populate({
        path: 'teacherId',
        populate: {
          path: 'userId',
          select: 'name email',
        },
      })
      .populate('subjectId', 'name description gradeLevel defaultTuitionFee');

    // 5. Định dạng dữ liệu trả về đầy đủ thông tin để hiển thị chi tiết
    const formattedClasses = classes.map(c => ({
      id: c._id,
      className: c.name,
      room: c.room,
      status: c.status,
      startDate: c.startDate,
      endDate: c.endDate,
      maxStudents: c.maxStudents,
      subjectName: c.subjectId ? c.subjectId.name : 'Chưa phân công',
      subjectDescription: c.subjectId ? c.subjectId.description : 'Không có mô tả',
      subjectGradeLevel: c.subjectId ? c.subjectId.gradeLevel : 'N/A',
      subjectTuitionFee: c.subjectId ? c.subjectId.defaultTuitionFee : 0,
      teacherName: (c.teacherId && c.teacherId.userId) ? c.teacherId.userId.name : 'Chưa phân công',
      teacherEmail: (c.teacherId && c.teacherId.userId) ? c.teacherId.userId.email : '',
    }));

    return res.status(200).json({
      success: true,
      total: formattedClasses.length,
      data: formattedClasses,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getChildren,
  getChildSchedules,
  getChildGrades,
  getChildTeachers,
  getChildClasses,
};

/**
 * @desc    Xem danh sách học viên trong một lớp con đang học
 * @route   GET /api/parent/classes/:classId/students
 * @access  Private (Parent)
 */
const getStudentsInClassForParent = async (req, res) => {
  try {
    const { classId } = req.params;
    
    // 1. Tìm StudentProfile của các con phụ huynh này
    const parentProfile = await ParentProfile.findOne({ userId: req.user._id });
    if (!parentProfile) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin hồ sơ Phụ huynh',
      });
    }

    const studentProfiles = await StudentProfile.find({
      userId: { $in: parentProfile.children },
    });
    const studentProfileIds = studentProfiles.map(sp => sp._id.toString());

    // 2. Kiểm tra xem có đứa con nào đang học lớp này không
    const isEnrolled = await ClassStudent.findOne({
      classId,
      studentId: { $in: studentProfileIds },
      status: 'enrolled',
    });

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập thông tin lớp học này do con bạn không học ở đây.',
      });
    }

    // 3. Lấy danh sách học viên trong lớp
    const classStudents = await ClassStudent.find({ classId, status: 'enrolled' })
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'name email',
        },
      });

    // Định dạng gọn gàng trả về
    const formattedStudents = classStudents.map(cs => {
      const s = cs.studentId;
      return {
        studentId: s._id,
        name: s.userId ? s.userId.name : 'N/A',
        email: s.userId ? s.userId.email : 'N/A',
        grade: s.grade,
        school: s.school,
      };
    });

    return res.status(200).json({
      success: true,
      total: formattedStudents.length,
      data: formattedStudents,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getChildren,
  getChildSchedules,
  getChildGrades,
  getChildTeachers,
  getChildClasses,
  getStudentsInClassForParent,
};

/**
 * @desc    Xem thông tin hồ sơ của phụ huynh đang đăng nhập
 * @route   GET /api/parent/profile
 * @access  Private (Parent)
 */
const getParentProfile = async (req, res) => {
  try {
    const parentProfile = await ParentProfile.findOne({ userId: req.user._id })
      .populate('userId', 'name email role')
      .populate('children', 'name email');

    if (!parentProfile) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ Phụ huynh',
      });
    }

    return res.status(200).json({
      success: true,
      data: parentProfile,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getChildren,
  getChildSchedules,
  getChildGrades,
  getChildTeachers,
  getChildClasses,
  getStudentsInClassForParent,
  getParentProfile,
};


