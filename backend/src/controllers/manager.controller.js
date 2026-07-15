// Chức năng của Manager: Controller xử lý toàn bộ API cho role Manager
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const TeacherProfile = require('../models/TeacherProfile');
const ParentProfile = require('../models/ParentProfile');
const ParentStudent = require('../models/ParentStudent');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const ClassStudent = require('../models/ClassStudent');
const Schedule = require('../models/Schedule');
const Invoice = require('../models/Invoice');

const {
  buildSearchFilter,
  createStudentUserAndProfile,
  createParentUserAndProfile,
  createTeacherUserAndProfile,
  checkTeacherExists,
  checkStudentExists,
  checkClassExists,
  checkSubjectExists,
  checkScheduleConflict,
  calculateInvoiceSummary,
} = require('../services/manager.service');

// ============================================================
// DASHBOARD
// ============================================================

/**
 * @desc    Lấy thống kê dashboard cho Manager
 * @route   GET /api/manager/dashboard
 * @access  Private (MANAGER)
 */
const getManagerDashboard = async (req, res) => {
  try {
    // Student stats
    const totalStudents = await StudentProfile.countDocuments();
    const activeStudentUsers = await User.countDocuments({ role: 'student', isActive: true });
    const inactiveStudentUsers = await User.countDocuments({ role: 'student', isActive: false });

    // Teacher stats
    const totalTeachers = await TeacherProfile.countDocuments();
    const activeTeacherUsers = await User.countDocuments({ role: 'teacher', isActive: true });

    // Class stats
    const totalClasses = await Class.countDocuments();
    const activeClasses = await Class.countDocuments({ status: 'ongoing' });
    const upcomingClasses = await Class.countDocuments({ status: 'scheduled' });
    const finishedClasses = await Class.countDocuments({ status: 'completed' });
    const cancelledClasses = await Class.countDocuments({ status: 'cancelled' });

    // Schedule stats
    const totalSchedules = await Schedule.countDocuments();
    const activeSchedules = await Schedule.countDocuments({ status: 'active' });
    const cancelledSchedules = await Schedule.countDocuments({ status: 'cancelled' });

    // Finance stats
    const financeStats = await calculateInvoiceSummary();

    return res.status(200).json({
      success: true,
      message: 'Get manager dashboard successfully',
      data: {
        students: {
          total: totalStudents,
          active: activeStudentUsers,
          inactive: inactiveStudentUsers,
        },
        teachers: {
          total: totalTeachers,
          active: activeTeacherUsers,
        },
        classes: {
          total: totalClasses,
          active: activeClasses,
          upcoming: upcomingClasses,
          finished: finishedClasses,
          cancelled: cancelledClasses,
        },
        schedules: {
          total: totalSchedules,
          active: activeSchedules,
          cancelled: cancelledSchedules,
        },
        finance: financeStats,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// STUDENTS
// ============================================================

/**
 * @desc    Lấy danh sách học viên
 * @route   GET /api/manager/students
 * @access  Private (MANAGER)
 */
const getManagerStudents = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Tìm user IDs matching search
    let userFilter = { role: 'student' };
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      userFilter.$or = [
        { name: searchRegex },
        { email: searchRegex },
      ];
    }

    const matchingUserIds = await User.find(userFilter).select('_id');
    const userIds = matchingUserIds.map((u) => u._id);

    let profileFilter = { userId: { $in: userIds } };
    if (status && status !== 'ALL') {
      profileFilter.status = status.toLowerCase();
    }

    const total = await StudentProfile.countDocuments(profileFilter);
    const students = await StudentProfile.find(profileFilter)
      .populate('userId', 'name email role isActive createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Summary using StudentProfile statuses
    const allStudentUsers = await StudentProfile.countDocuments();
    const activeStudents = await StudentProfile.countDocuments({ status: 'active' });
    const inactiveStudents = await StudentProfile.countDocuments({ status: 'inactive' });
    const reservedStudents = await StudentProfile.countDocuments({ status: 'reserved' });
    const finishedStudents = await StudentProfile.countDocuments({ status: 'finished' });

    return res.status(200).json({
      success: true,
      message: 'Get students successfully',
      data: {
        students,
        summary: {
          totalStudents: allStudentUsers,
          activeStudents,
          inactiveStudents,
          reservedStudents,
          finishedStudents,
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Lấy chi tiết học viên
 * @route   GET /api/manager/students/:studentId
 * @access  Private (MANAGER)
 */
const getManagerStudentDetail = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await StudentProfile.findById(studentId)
      .populate('userId', 'name email role isActive createdAt');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Lấy danh sách lớp đang học
    const classStudents = await ClassStudent.find({ studentId, status: 'enrolled' })
      .populate({
        path: 'classId',
        populate: [
          { path: 'subjectId', select: 'name' },
          { path: 'teacherId', populate: { path: 'userId', select: 'name' } },
        ],
      });

    return res.status(200).json({
      success: true,
      message: 'Get student detail successfully',
      data: {
        student,
        classes: classStudents.map((cs) => cs.classId),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Tạo học viên mới
 * @route   POST /api/manager/students
 * @access  Private (MANAGER)
 */
const createManagerStudent = async (req, res) => {
  try {
    const { fullName, email, grade } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Full Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    if (!grade || !grade.trim()) {
      return res.status(400).json({ success: false, message: 'Grade is required' });
    }

    const result = await createStudentUserAndProfile(req.body);

    return res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: result,
    });
  } catch (error) {
    const statusCode = error.message.includes('đã tồn tại') ? 409 : 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Cập nhật học viên
 * @route   PUT /api/manager/students/:studentId
 * @access  Private (MANAGER)
 */
const updateManagerStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { fullName, grade, schoolName, parentPhone, status } = req.body;

    const student = await StudentProfile.findById(studentId).populate('userId');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (fullName) {
      student.userId.name = fullName;
    }
    
    // Update isActive based on status
    if (status) {
      student.status = status;
      student.userId.isActive = status !== 'inactive';
    }

    await student.userId.save();

    if (grade !== undefined) student.grade = grade;
    if (schoolName !== undefined) student.school = schoolName;
    if (parentPhone !== undefined) student.parentPhone = parentPhone;

    await student.save();

    return res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Xóa học viên
 * @route   DELETE /api/manager/students/:studentId
 * @access  Private (MANAGER)
 */
const deleteManagerStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await StudentProfile.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await User.findByIdAndDelete(student.userId);
    await StudentProfile.findByIdAndDelete(studentId);
    
    // Xóa các liên kết (tuỳ chọn)
    await ParentStudent.deleteMany({ studentId });
    await ClassStudent.deleteMany({ studentId });

    return res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// PARENTS
// ============================================================

/**
 * @desc    Lấy danh sách phụ huynh
 * @route   GET /api/manager/parents
 * @access  Private (MANAGER)
 */
const getManagerParents = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Tìm user IDs matching search
    let userFilter = { role: 'parent' };
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      userFilter.$or = [
        { name: searchRegex },
        { email: searchRegex },
      ];
    }
    if (status === 'active') userFilter.isActive = true;
    if (status === 'inactive') userFilter.isActive = false;

    const matchingUserIds = await User.find(userFilter).select('_id');
    const userIds = matchingUserIds.map((u) => u._id);

    // Profile filter
    let profileFilter = { userId: { $in: userIds } };

    const total = await ParentProfile.countDocuments(profileFilter);
    const parents = await ParentProfile.find(profileFilter)
      .populate('userId', 'name email role isActive createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Tính childrenCount cho mỗi parent
    const parentsWithChildren = await Promise.all(
      parents.map(async (parent) => {
        const childrenCount = await ParentStudent.countDocuments({
          parentId: parent._id,
          status: 'active',
        });
        return { ...parent.toObject(), childrenCount };
      })
    );

    return res.status(200).json({
      success: true,
      message: 'Get parents successfully',
      data: {
        parents: parentsWithChildren,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Lấy chi tiết phụ huynh
 * @route   GET /api/manager/parents/:parentId
 * @access  Private (MANAGER)
 */
const getManagerParentDetail = async (req, res) => {
  try {
    const { parentId } = req.params;

    const parent = await ParentProfile.findById(parentId)
      .populate('userId', 'name email role isActive createdAt');

    if (!parent) {
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }

    const childrenCount = await ParentStudent.countDocuments({
      parentId: parent._id,
      status: 'active',
    });

    return res.status(200).json({
      success: true,
      message: 'Get parent detail successfully',
      data: { ...parent.toObject(), childrenCount },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Tạo phụ huynh mới
 * @route   POST /api/manager/parents
 * @access  Private (MANAGER)
 */
const createManagerParent = async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Full Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Phone is required' });
    }

    const result = await createParentUserAndProfile(req.body);

    return res.status(201).json({
      success: true,
      message: 'Parent created successfully',
      data: result,
    });
  } catch (error) {
    const statusCode = error.message.includes('đã tồn tại') ? 409 : 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Lấy danh sách con của phụ huynh
 * @route   GET /api/manager/parents/:parentId/students
 * @access  Private (MANAGER)
 */
const getManagerParentStudents = async (req, res) => {
  try {
    const { parentId } = req.params;

    const parent = await ParentProfile.findById(parentId);
    if (!parent) {
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }

    const links = await ParentStudent.find({ parentId, status: 'active' })
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email role isActive' },
      });

    const students = links.map((link) => ({
      ...link.studentId.toObject(),
      relationship: link.relationship,
    }));

    return res.status(200).json({
      success: true,
      message: 'Get parent students successfully',
      data: students,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Liên kết phụ huynh với học viên
 * @route   POST /api/manager/parents/:parentId/students
 * @access  Private (MANAGER)
 */
const linkManagerParentStudent = async (req, res) => {
  try {
    const { parentId } = req.params;
    const { studentId, relationship } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'studentId is required' });
    }

    // Kiểm tra parent tồn tại
    const parent = await ParentProfile.findById(parentId);
    if (!parent) {
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }

    // Kiểm tra student tồn tại
    await checkStudentExists(studentId);

    // Kiểm tra đã liên kết chưa
    const existingLink = await ParentStudent.findOne({ parentId, studentId });
    if (existingLink) {
      if (existingLink.status === 'active') {
        return res.status(409).json({ success: false, message: 'Liên kết đã tồn tại' });
      }
      // Nếu đã inactive thì reactive
      existingLink.status = 'active';
      existingLink.relationship = relationship || existingLink.relationship;
      await existingLink.save();
      return res.status(200).json({
        success: true,
        message: 'Parent-student link reactivated',
        data: existingLink,
      });
    }

    const link = await ParentStudent.create({
      parentId,
      studentId,
      relationship: relationship || 'Guardian',
      status: 'active',
    });

    return res.status(201).json({
      success: true,
      message: 'Linked parent-student successfully',
      data: link,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// TEACHERS
// ============================================================

/**
 * @desc    Lấy danh sách giáo viên
 * @route   GET /api/manager/teachers
 * @access  Private (MANAGER)
 */
const getManagerTeachers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let userFilter = { role: 'teacher' };
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      userFilter.$or = [
        { name: searchRegex },
        { email: searchRegex },
      ];
    }
    if (status === 'active') userFilter.isActive = true;
    if (status === 'inactive') userFilter.isActive = false;

    const matchingUserIds = await User.find(userFilter).select('_id');
    const userIds = matchingUserIds.map((u) => u._id);

    const total = await TeacherProfile.countDocuments({ userId: { $in: userIds } });
    const teachers = await TeacherProfile.find({ userId: { $in: userIds } })
      .populate('userId', 'name email role isActive createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      message: 'Get teachers successfully',
      data: {
        teachers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Tạo giáo viên mới
 * @route   POST /api/manager/teachers
 * @access  Private (MANAGER)
 */
const createManagerTeacher = async (req, res) => {
  try {
    const { fullName, email } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Full Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const result = await createTeacherUserAndProfile(req.body);

    return res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      data: result,
    });
  } catch (error) {
    const statusCode = error.message.includes('đã tồn tại') ? 409 : 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Lấy chi tiết giáo viên
 * @route   GET /api/manager/teachers/:teacherId
 * @access  Private (MANAGER)
 */
const getManagerTeacherDetail = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await TeacherProfile.findById(teacherId)
      .populate('userId', 'name email role isActive createdAt');

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Lấy danh sách lớp đang dạy
    const classes = await Class.find({ teacherId })
      .populate('subjectId', 'name gradeLevel');

    return res.status(200).json({
      success: true,
      message: 'Get teacher detail successfully',
      data: { teacher, classes },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// SUBJECTS
// ============================================================

/**
 * @desc    Lấy danh sách môn học
 * @route   GET /api/manager/subjects
 * @access  Private (MANAGER)
 */
const getManagerSubjects = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let filter = {};
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { gradeLevel: searchRegex },
      ];
    }
    if (status && status !== 'ALL') {
      filter.status = status.toLowerCase();
    }

    const total = await Subject.countDocuments(filter);
    const subjects = await Subject.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      message: 'Get subjects successfully',
      data: {
        subjects,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Tạo môn học mới
 * @route   POST /api/manager/subjects
 * @access  Private (MANAGER)
 */
const createManagerSubject = async (req, res) => {
  try {
    const { name, description, gradeLevel, defaultTuitionFee, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Subject name is required' });
    }
    if (!gradeLevel || !gradeLevel.trim()) {
      return res.status(400).json({ success: false, message: 'Grade level is required' });
    }
    if (defaultTuitionFee !== undefined && Number(defaultTuitionFee) < 0) {
      return res.status(400).json({ success: false, message: 'Tuition fee must be >= 0' });
    }

    const subject = await Subject.create({
      name,
      description: description || '',
      gradeLevel,
      defaultTuitionFee: defaultTuitionFee || 0,
      status: status ? status.toLowerCase() : 'active',
    });

    return res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: subject,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// CLASSES
// ============================================================

/**
 * @desc    Lấy danh sách lớp học
 * @route   GET /api/manager/classes
 * @access  Private (MANAGER)
 */
const getManagerClasses = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let filter = {};
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { name: searchRegex },
        { room: searchRegex },
      ];
    }
    if (status && status !== 'ALL') {
      // Map FE status names to backend values
      const statusMap = {
        'ACTIVE': 'ongoing',
        'UPCOMING': 'scheduled',
        'FINISHED': 'completed',
        'CANCELLED': 'cancelled',
      };
      filter.status = statusMap[status.toUpperCase()] || status.toLowerCase();
    }

    const total = await Class.countDocuments(filter);
    const classes = await Class.find(filter)
      .populate('subjectId', 'name gradeLevel defaultTuitionFee')
      .populate({
        path: 'teacherId',
        populate: { path: 'userId', select: 'name email' },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Tính currentStudents cho mỗi class
    const classesWithCount = await Promise.all(
      classes.map(async (cls) => {
        const currentStudents = await ClassStudent.countDocuments({
          classId: cls._id,
          status: 'enrolled',
        });
        return { ...cls.toObject(), currentStudents };
      })
    );

    return res.status(200).json({
      success: true,
      message: 'Get classes successfully',
      data: {
        classes: classesWithCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Lấy chi tiết lớp học
 * @route   GET /api/manager/classes/:classId
 * @access  Private (MANAGER)
 */
const getManagerClassDetail = async (req, res) => {
  try {
    const { classId } = req.params;

    const classInfo = await Class.findById(classId)
      .populate('subjectId', 'name gradeLevel defaultTuitionFee')
      .populate({
        path: 'teacherId',
        populate: { path: 'userId', select: 'name email' },
      });

    if (!classInfo) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const currentStudents = await ClassStudent.countDocuments({
      classId,
      status: 'enrolled',
    });

    return res.status(200).json({
      success: true,
      message: 'Get class detail successfully',
      data: { ...classInfo.toObject(), currentStudents },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Tạo lớp học mới
 * @route   POST /api/manager/classes
 * @access  Private (MANAGER)
 */
const createManagerClass = async (req, res) => {
  try {
    const { name, subjectId, teacherId, room, maxStudents, startDate, endDate, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Class name is required' });
    }
    if (!subjectId) {
      return res.status(400).json({ success: false, message: 'Subject is required' });
    }
    if (!teacherId) {
      return res.status(400).json({ success: false, message: 'Teacher is required' });
    }
    if (maxStudents && Number(maxStudents) <= 0) {
      return res.status(400).json({ success: false, message: 'Max students must be > 0' });
    }

    await checkSubjectExists(subjectId);
    await checkTeacherExists(teacherId);

    // Map FE status to BE status
    const statusMap = {
      'UPCOMING': 'scheduled',
      'ACTIVE': 'ongoing',
      'FINISHED': 'completed',
      'CANCELLED': 'cancelled',
    };

    const newClass = await Class.create({
      name,
      subjectId,
      teacherId,
      room: room || '',
      maxStudents: maxStudents || 20,
      startDate: startDate || null,
      endDate: endDate || null,
      status: status ? (statusMap[status.toUpperCase()] || status.toLowerCase()) : 'scheduled',
    });

    const populated = await Class.findById(newClass._id)
      .populate('subjectId', 'name gradeLevel')
      .populate({
        path: 'teacherId',
        populate: { path: 'userId', select: 'name email' },
      });

    return res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: populated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Lấy danh sách học viên trong lớp
 * @route   GET /api/manager/classes/:classId/students
 * @access  Private (MANAGER)
 */
const getManagerClassStudents = async (req, res) => {
  try {
    const { classId } = req.params;

    await checkClassExists(classId);

    const classStudents = await ClassStudent.find({ classId, status: 'enrolled' })
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email role isActive' },
      });

    const students = classStudents.map((cs) => cs.studentId);

    return res.status(200).json({
      success: true,
      message: 'Get class students successfully',
      data: students,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Thêm học viên vào lớp
 * @route   POST /api/manager/classes/:classId/students
 * @access  Private (MANAGER)
 */
const addManagerStudentToClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { studentId, studentIds } = req.body;

    let targetIds = [];
    if (studentIds && Array.isArray(studentIds)) {
      targetIds = studentIds;
    } else if (studentId) {
      targetIds = [studentId];
    }

    if (targetIds.length === 0) {
      return res.status(400).json({ success: false, message: 'studentId or studentIds array is required' });
    }

    const classInfo = await checkClassExists(classId);

    // Không thêm nếu lớp đã kết thúc hoặc hủy
    if (['completed', 'cancelled'].includes(classInfo.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot add student to a finished or cancelled class',
      });
    }

    // Check maxStudents
    const currentCount = await ClassStudent.countDocuments({ classId, status: 'enrolled' });
    if (currentCount + targetIds.length > classInfo.maxStudents) {
      return res.status(400).json({ success: false, message: 'Class does not have enough capacity' });
    }

    let addedCount = 0;
    for (const sId of targetIds) {
      await checkStudentExists(sId);
      const existing = await ClassStudent.findOne({ classId, studentId: sId });
      if (existing) {
        if (existing.status !== 'enrolled') {
          existing.status = 'enrolled';
          await existing.save();
          addedCount++;
        }
      } else {
        await ClassStudent.create({
          classId,
          studentId: sId,
          status: 'enrolled',
        });
        addedCount++;
      }
    }

    return res.status(201).json({
      success: true,
      message: `Successfully added ${addedCount} student(s) to class`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// SCHEDULES
// ============================================================

/**
 * @desc    Lấy danh sách lịch học
 * @route   GET /api/manager/schedules
 * @access  Private (MANAGER)
 */
const getManagerSchedules = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let filter = {};
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { room: searchRegex },
        { dayOfWeek: searchRegex },
      ];
    }
    if (status && status !== 'ALL') {
      filter.status = status.toLowerCase();
    }

    const total = await Schedule.countDocuments(filter);
    const schedules = await Schedule.find(filter)
      .populate({
        path: 'classId',
        select: 'name room',
      })
      .populate({
        path: 'teacherId',
        populate: { path: 'userId', select: 'name email' },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      message: 'Get schedules successfully',
      data: {
        schedules,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Tạo lịch học mới
 * @route   POST /api/manager/schedules
 * @access  Private (MANAGER)
 */
const createManagerSchedule = async (req, res) => {
  try {
    const { classId, teacherId, dayOfWeek, startTime, endTime, room, status } = req.body;

    if (!classId) return res.status(400).json({ success: false, message: 'classId is required' });
    if (!teacherId) return res.status(400).json({ success: false, message: 'teacherId is required' });
    if (!dayOfWeek) return res.status(400).json({ success: false, message: 'dayOfWeek is required' });
    if (!startTime) return res.status(400).json({ success: false, message: 'startTime is required' });
    if (!endTime) return res.status(400).json({ success: false, message: 'endTime is required' });
    if (!room) return res.status(400).json({ success: false, message: 'room is required' });

    if (endTime <= startTime) {
      return res.status(400).json({ success: false, message: 'endTime must be after startTime' });
    }

    await checkClassExists(classId);
    await checkTeacherExists(teacherId);

    // Conflict check
    await checkScheduleConflict({ teacherId, dayOfWeek, startTime, endTime, room });

    const schedule = await Schedule.create({
      classId,
      teacherId,
      dayOfWeek,
      startTime,
      endTime,
      room,
      status: status ? status.toLowerCase() : 'active',
    });

    const populated = await Schedule.findById(schedule._id)
      .populate('classId', 'name room')
      .populate({
        path: 'teacherId',
        populate: { path: 'userId', select: 'name email' },
      });

    return res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      data: populated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// INVOICES
// ============================================================

/**
 * @desc    Lấy danh sách hóa đơn
 * @route   GET /api/manager/invoices
 * @access  Private (MANAGER)
 */
const getManagerInvoices = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let filter = {};
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { month: searchRegex },
      ];
    }
    if (status && status !== 'ALL') {
      filter.status = status.toLowerCase();
    }

    const total = await Invoice.countDocuments(filter);
    const invoices = await Invoice.find(filter)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('classId', 'name room')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Summary
    const summary = await calculateInvoiceSummary();

    return res.status(200).json({
      success: true,
      message: 'Get invoices successfully',
      data: {
        invoices,
        summary,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Tạo hóa đơn mới
 * @route   POST /api/manager/invoices
 * @access  Private (MANAGER)
 */
const createManagerInvoice = async (req, res) => {
  try {
    const { studentId, classId, amount, month, dueDate, status } = req.body;

    if (!studentId) return res.status(400).json({ success: false, message: 'studentId is required' });
    if (!classId) return res.status(400).json({ success: false, message: 'classId is required' });
    if (!amount || Number(amount) <= 0) return res.status(400).json({ success: false, message: 'Amount must be > 0' });
    if (!month) return res.status(400).json({ success: false, message: 'month is required' });
    if (!dueDate) return res.status(400).json({ success: false, message: 'dueDate is required' });

    await checkStudentExists(studentId);
    await checkClassExists(classId);

    // Check student thuộc class
    const enrolled = await ClassStudent.findOne({ classId, studentId, status: 'enrolled' });
    if (!enrolled) {
      return res.status(400).json({ success: false, message: 'Student is not enrolled in this class' });
    }

    const invoice = await Invoice.create({
      studentId,
      classId,
      amount: Number(amount),
      month,
      dueDate,
      status: status ? status.toLowerCase() : 'unpaid',
      paidAmount: 0,
    });

    return res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Đánh dấu hóa đơn đã thanh toán
 * @route   PATCH /api/manager/invoices/:invoiceId/pay
 * @access  Private (MANAGER)
 */
const markManagerInvoicePaid = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { paidAmount, paymentDate, note } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (!paidAmount || Number(paidAmount) <= 0) {
      return res.status(400).json({ success: false, message: 'paidAmount must be > 0' });
    }

    const paid = Number(paidAmount);
    invoice.paidAmount = paid;
    invoice.paymentDate = paymentDate || new Date();
    invoice.note = note || invoice.note;
    invoice.status = paid >= invoice.amount ? 'paid' : 'partial';

    await invoice.save();

    return res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// TEACHERS (CONTINUED)
// ============================================================

const updateManagerTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { fullName, specialization, experienceYears, phoneNumber, status } = req.body;

    const teacher = await TeacherProfile.findById(teacherId).populate('userId');
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    if (fullName) {
      teacher.userId.name = fullName;
    }
    
    if (status) {
      teacher.userId.isActive = status !== 'inactive';
    }

    await teacher.userId.save();

    if (specialization !== undefined) teacher.specialization = typeof specialization === 'string' ? specialization.split(',').map(s => s.trim()) : specialization;
    if (experienceYears !== undefined) teacher.experienceYears = Number(experienceYears);
    if (phoneNumber !== undefined) teacher.phoneNumber = phoneNumber;

    await teacher.save();

    return res.status(200).json({
      success: true,
      message: 'Teacher updated successfully',
      data: teacher,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteManagerTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const teacher = await TeacherProfile.findById(teacherId);
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    await User.findByIdAndDelete(teacher.userId);
    await TeacherProfile.findByIdAndDelete(teacherId);
    
    return res.status(200).json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// SUBJECTS (CONTINUED)
// ============================================================

const getManagerSubjectDetail = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });

    return res.status(200).json({
      success: true,
      message: 'Get subject detail successfully',
      data: subject,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateManagerSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { name, description, gradeLevel, defaultTuitionFee, status } = req.body;

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });

    if (name) subject.name = name;
    if (description !== undefined) subject.description = description;
    if (gradeLevel) subject.gradeLevel = gradeLevel;
    if (defaultTuitionFee !== undefined) subject.defaultTuitionFee = Number(defaultTuitionFee);
    if (status) subject.status = status.toLowerCase();

    await subject.save();

    return res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: subject,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteManagerSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const subject = await Subject.findByIdAndDelete(subjectId);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });

    return res.status(200).json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// CLASSES (CONTINUED)
// ============================================================

const updateManagerClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { name, subjectId, teacherId, room, maxStudents, startDate, endDate, status } = req.body;

    const classInfo = await Class.findById(classId);
    if (!classInfo) return res.status(404).json({ success: false, message: 'Class not found' });

    if (subjectId && subjectId !== classInfo.subjectId.toString()) {
      await checkSubjectExists(subjectId);
      classInfo.subjectId = subjectId;
    }
    if (teacherId && teacherId !== classInfo.teacherId.toString()) {
      await checkTeacherExists(teacherId);
      classInfo.teacherId = teacherId;
    }

    if (name) classInfo.name = name;
    if (room !== undefined) classInfo.room = room;
    if (maxStudents) classInfo.maxStudents = Number(maxStudents);
    if (startDate !== undefined) classInfo.startDate = startDate || null;
    if (endDate !== undefined) classInfo.endDate = endDate || null;
    
    if (status) {
      const statusMap = {
        'UPCOMING': 'scheduled',
        'ACTIVE': 'ongoing',
        'FINISHED': 'completed',
        'CANCELLED': 'cancelled',
      };
      classInfo.status = statusMap[status.toUpperCase()] || status.toLowerCase();
    }

    await classInfo.save();

    return res.status(200).json({
      success: true,
      message: 'Class updated successfully',
      data: classInfo,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteManagerClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const classInfo = await Class.findByIdAndDelete(classId);
    if (!classInfo) return res.status(404).json({ success: false, message: 'Class not found' });

    await ClassStudent.deleteMany({ classId });
    await Schedule.deleteMany({ classId });

    return res.status(200).json({ success: true, message: 'Class deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// SCHEDULES (CONTINUED)
// ============================================================

const getManagerScheduleDetail = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const schedule = await Schedule.findById(scheduleId)
      .populate('classId', 'name room')
      .populate({
        path: 'teacherId',
        populate: { path: 'userId', select: 'name email' },
      });

    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });

    return res.status(200).json({
      success: true,
      message: 'Get schedule detail successfully',
      data: schedule,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateManagerSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { classId, teacherId, dayOfWeek, startTime, endTime, room, status } = req.body;

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });

    if (classId && classId !== schedule.classId.toString()) {
      await checkClassExists(classId);
      schedule.classId = classId;
    }
    if (teacherId && teacherId !== schedule.teacherId.toString()) {
      await checkTeacherExists(teacherId);
      schedule.teacherId = teacherId;
    }

    if (dayOfWeek !== undefined) schedule.dayOfWeek = dayOfWeek;
    if (startTime) schedule.startTime = startTime;
    if (endTime) schedule.endTime = endTime;
    if (room !== undefined) schedule.room = room;
    if (status) schedule.status = status.toLowerCase();

    if (schedule.endTime <= schedule.startTime) {
      return res.status(400).json({ success: false, message: 'endTime must be after startTime' });
    }

    await schedule.save();

    return res.status(200).json({
      success: true,
      message: 'Schedule updated successfully',
      data: schedule,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteManagerSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const schedule = await Schedule.findByIdAndDelete(scheduleId);
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });

    return res.status(200).json({ success: true, message: 'Schedule deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// INVOICES (CONTINUED)
// ============================================================

const getManagerInvoiceDetail = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const invoice = await Invoice.findById(invoiceId)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('classId', 'name room');

    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    return res.status(200).json({
      success: true,
      message: 'Get invoice detail successfully',
      data: invoice,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateManagerInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { studentId, classId, amount, month, dueDate, status } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    if (studentId && studentId !== invoice.studentId.toString()) {
      await checkStudentExists(studentId);
      invoice.studentId = studentId;
    }
    if (classId && classId !== invoice.classId.toString()) {
      await checkClassExists(classId);
      invoice.classId = classId;
    }

    if (amount) invoice.amount = Number(amount);
    if (month) invoice.month = month;
    if (dueDate) invoice.dueDate = dueDate;
    if (status) invoice.status = status.toLowerCase();

    await invoice.save();

    return res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteManagerInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const invoice = await Invoice.findByIdAndDelete(invoiceId);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    return res.status(200).json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
  updateManagerTeacher,
  deleteManagerTeacher,
  getManagerSubjectDetail,
  updateManagerSubject,
  deleteManagerSubject,
  updateManagerClass,
  deleteManagerClass,
  getManagerScheduleDetail,
  updateManagerSchedule,
  deleteManagerSchedule,
  getManagerInvoiceDetail,
  updateManagerInvoice,
  deleteManagerInvoice,
  getManagerDashboard,
  getManagerStudents,
  getManagerStudentDetail,
  createManagerStudent,
  updateManagerStudent,
  deleteManagerStudent,
  getManagerParents,
  getManagerParentDetail,
  createManagerParent,
  getManagerParentStudents,
  linkManagerParentStudent,
  getManagerTeachers,
  createManagerTeacher,
  getManagerTeacherDetail,
  getManagerSubjects,
  createManagerSubject,
  getManagerClasses,
  getManagerClassDetail,
  createManagerClass,
  getManagerClassStudents,
  addManagerStudentToClass,
  getManagerSchedules,
  createManagerSchedule,
  getManagerInvoices,
  createManagerInvoice,
  markManagerInvoicePaid,
};
