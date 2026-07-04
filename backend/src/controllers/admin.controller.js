const User = require('../models/User');
const TeacherProfile = require('../models/TeacherProfile');
const StudentProfile = require('../models/StudentProfile');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const ClassStudent = require('../models/ClassStudent');
const Schedule = require('../models/Schedule');

// Helper to map DB user to FE user format
const mapUserToFE = async (user) => {
  let phone = '';
  if (user.role === 'teacher') {
    const profile = await TeacherProfile.findOne({ userId: user._id });
    if (profile) phone = profile.phoneNumber || '';
  } else if (user.role === 'student') {
    const profile = await StudentProfile.findOne({ userId: user._id });
    if (profile) phone = profile.parentPhone || '';
  }

  return {
    _id: user._id,
    fullName: user.name,
    email: user.email,
    phone,
    role: user.role.toUpperCase(),
    status: user.isActive ? 'ACTIVE' : 'INACTIVE',
    createdAt: user.createdAt
  };
};

// ============================================================
// @desc    Lay dashboard tong quan cho Admin
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
// ============================================================
const getDashboard = async (req, res) => {
  try {
    // 1. Thống kê User
    const totalUsers = await User.countDocuments();
    const teachers = await User.countDocuments({ role: 'teacher' });
    const students = await User.countDocuments({ role: 'student' });
    const parents = await User.countDocuments({ role: 'parent' });
    const managers = await User.countDocuments({ role: 'manager' });
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    // Detailed role active status for layout
    const activeStudents = await User.countDocuments({ role: 'student', isActive: true });
    const inactiveStudents = await User.countDocuments({ role: 'student', isActive: false });
    const activeTeachers = await User.countDocuments({ role: 'teacher', isActive: true });
    const inactiveTeachers = await User.countDocuments({ role: 'teacher', isActive: false });

    // 2. Thống kê Class
    const totalClasses = await Class.countDocuments();
    const activeClasses = await Class.countDocuments({ status: 'ongoing' });
    const upcomingClasses = await Class.countDocuments({ status: 'scheduled' });
    const finishedClasses = await Class.countDocuments({ status: 'completed' });
    const cancelledClasses = await Class.countDocuments({ status: 'cancelled' });

    // 3. Thống kê Schedule
    const totalSchedules = await Schedule.countDocuments();
    const activeSchedules = await Schedule.countDocuments({ status: 'active' });
    const cancelledSchedules = await Schedule.countDocuments({ status: 'cancelled' });

    // 4. Mock Finance (Since no invoice model is implemented)
    const finance = {
      totalInvoices: 9,
      monthlyRevenue: 1550000,
      paidInvoices: 5,
      unpaidInvoices: 3
    };

    return res.status(200).json({
      success: true,
      message: "Get dashboard statistics successfully",
      data: {
        users: {
          totalUsers,
          teachers,
          students,
          parents,
          managers,
          activeUsers,
          inactiveUsers,
          activeStudents,
          inactiveStudents,
          activeTeachers,
          inactiveTeachers
        },
        classes: {
          totalClasses,
          activeClasses,
          upcomingClasses,
          finishedClasses,
          cancelledClasses
        },
        schedules: {
          totalSchedules,
          activeSchedules,
          cancelledSchedules
        },
        finance
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// @desc    Lay danh sach User kem theo filter
// @route   GET /api/admin/users
// @access  Private (Admin)
// ============================================================
const getUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    let query = {};

    if (role && role !== 'ALL') {
      query.role = role.toLowerCase();
    }
    if (status && status !== 'ALL') {
      if (status === 'ACTIVE') {
        query.isActive = true;
      } else {
        query.isActive = false;
      }
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    const mappedUsers = await Promise.all(users.map(u => mapUserToFE(u)));

    return res.status(200).json({
      success: true,
      message: "Get users successfully",
      data: mappedUsers
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// @desc    Lay chi tiet mot User
// @route   GET /api/admin/users/:userId
// @access  Private (Admin)
// ============================================================
const getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const feUser = await mapUserToFE(user);
    return res.status(200).json({
      success: true,
      message: "Get user detail successfully",
      data: feUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// @desc    Tao moi mot User
// @route   POST /api/admin/users
// @access  Private (Admin)
// ============================================================
const createUser = async (req, res) => {
  try {
    const { fullName, email, phone, password, role, status } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const user = await User.create({
      name: fullName,
      email,
      password,
      role: role.toLowerCase(),
      isActive: status === 'ACTIVE'
    });

    // Tu dong tao profile tuong ung
    if (user.role === 'teacher') {
      await TeacherProfile.create({
        userId: user._id,
        specialization: [],
        experienceYears: 0,
        phoneNumber: phone || ''
      });
    } else if (user.role === 'student') {
      await StudentProfile.create({
        userId: user._id,
        parentPhone: phone || '',
        parentName: '',
        grade: '',
        school: ''
      });
    }

    const feUser = await mapUserToFE(user);
    return res.status(201).json({
      success: true,
      message: "Create user successfully",
      data: feUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// @desc    Cap nhat trang thai User
// @route   PATCH /api/admin/users/:userId/status
// @access  Private (Admin)
// ============================================================
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isActive = (status === 'ACTIVE');
    await user.save();

    const feUser = await mapUserToFE(user);
    return res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: feUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// @desc    Lay danh sach lop hoc
// @route   GET /api/admin/classes
// @access  Private (Admin)
// ============================================================
const getClasses = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status && status !== 'ALL') {
      const statusMap = {
        'UPCOMING': 'scheduled',
        'ACTIVE': 'ongoing',
        'FINISHED': 'completed',
        'CANCELLED': 'cancelled'
      };
      query.status = statusMap[status] || status.toLowerCase();
    }

    // Lay toan bo lop truoc de filter search
    const classes = await Class.find(query)
      .populate('subjectId', 'name')
      .populate({
        path: 'teacherId',
        populate: { path: 'userId', select: 'name' }
      });

    const mappedClasses = await Promise.all(
      classes.map(async (cls) => {
        const currentStudents = await ClassStudent.countDocuments({
          classId: cls._id,
          status: 'enrolled'
        });

        const subjectName = cls.subjectId ? cls.subjectId.name : 'Unknown';
        const teacherName = (cls.teacherId && cls.teacherId.userId) ? cls.teacherId.userId.name : 'Unknown';

        // FE Status Mapping
        const feStatusMap = {
          'scheduled': 'UPCOMING',
          'ongoing': 'ACTIVE',
          'completed': 'FINISHED',
          'cancelled': 'CANCELLED'
        };

        return {
          _id: cls._id,
          name: cls.name,
          subject: subjectName,
          teacher: teacherName,
          room: cls.room || 'TBD',
          maxStudents: cls.maxStudents || 20,
          currentStudents,
          startDate: cls.startDate ? cls.startDate.toISOString().split('T')[0] : '',
          endDate: cls.endDate ? cls.endDate.toISOString().split('T')[0] : '',
          status: feStatusMap[cls.status] || 'UPCOMING'
        };
      })
    );

    let result = mappedClasses;
    if (search) {
      const q = search.toLowerCase();
      result = mappedClasses.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.teacher.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      message: "Get classes successfully",
      data: result
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// @desc    Lay chi tiet lop hoc
// @route   GET /api/admin/classes/:classId
// @access  Private (Admin)
// ============================================================
const getClassDetail = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.classId)
      .populate('subjectId', 'name')
      .populate({
        path: 'teacherId',
        populate: { path: 'userId', select: 'name' }
      });

    if (!cls) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }

    const currentStudents = await ClassStudent.countDocuments({
      classId: cls._id,
      status: 'enrolled'
    });

    const feStatusMap = {
      'scheduled': 'UPCOMING',
      'ongoing': 'ACTIVE',
      'completed': 'FINISHED',
      'cancelled': 'CANCELLED'
    };

    const data = {
      _id: cls._id,
      name: cls.name,
      subject: cls.subjectId ? cls.subjectId.name : 'Unknown',
      teacher: (cls.teacherId && cls.teacherId.userId) ? cls.teacherId.userId.name : 'Unknown',
      room: cls.room || 'TBD',
      maxStudents: cls.maxStudents || 20,
      currentStudents,
      startDate: cls.startDate ? cls.startDate.toISOString().split('T')[0] : '',
      endDate: cls.endDate ? cls.endDate.toISOString().split('T')[0] : '',
      status: feStatusMap[cls.status] || 'UPCOMING'
    };

    return res.status(200).json({
      success: true,
      message: "Get class detail successfully",
      data
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// @desc    Tạo mới một lớp học
// @route   POST /api/admin/classes
// @access  Private (Admin)
// ============================================================
const createClass = async (req, res) => {
  try {
    const { name, subject, teacher, room, maxStudents, startDate, endDate, status } = req.body;

    // Tìm subjectId theo name
    const foundSubject = await Subject.findOne({ name: subject });
    if (!foundSubject) {
      return res.status(404).json({ success: false, message: `Subject '${subject}' not found` });
    }

    // Tìm teacherId (TeacherProfile) qua User name
    const foundUser = await User.findOne({ name: teacher, role: 'teacher' });
    if (!foundUser) {
      return res.status(404).json({ success: false, message: `Teacher user '${teacher}' not found` });
    }
    const foundTeacherProfile = await TeacherProfile.findOne({ userId: foundUser._id });
    if (!foundTeacherProfile) {
      return res.status(404).json({ success: false, message: `Teacher profile not found for '${teacher}'` });
    }

    const feStatusMap = {
      'UPCOMING': 'scheduled',
      'ACTIVE': 'ongoing',
      'FINISHED': 'completed',
      'CANCELLED': 'cancelled'
    };

    const classroom = await Class.create({
      name,
      subjectId: foundSubject._id,
      teacherId: foundTeacherProfile._id,
      room,
      maxStudents: parseInt(maxStudents) || 20,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(),
      status: feStatusMap[status] || 'scheduled'
    });

    const responseData = {
      _id: classroom._id,
      name: classroom.name,
      subject: foundSubject.name,
      teacher: foundUser.name,
      room: classroom.room,
      maxStudents: classroom.maxStudents,
      currentStudents: 0,
      startDate: classroom.startDate.toISOString().split('T')[0],
      endDate: classroom.endDate.toISOString().split('T')[0],
      status: status || 'UPCOMING'
    };

    return res.status(201).json({
      success: true,
      message: "Create class successfully",
      data: responseData
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// @desc    Lấy danh sách học viên trong lớp
// @route   GET /api/admin/classes/:classId/students
// @access  Private (Admin)
// ============================================================
const getClassStudents = async (req, res) => {
  try {
    const enrollments = await ClassStudent.find({
      classId: req.params.classId,
      status: 'enrolled'
    }).populate({
      path: 'studentId',
      populate: { path: 'userId', select: 'name email' }
    });

    const mappedStudents = enrollments.map(e => {
      const studentName = (e.studentId && e.studentId.userId) ? e.studentId.userId.name : 'Unknown';
      const email = (e.studentId && e.studentId.userId) ? e.studentId.userId.email : 'Unknown';
      const phone = e.studentId ? e.studentId.parentPhone : 'Unknown';

      return {
        _id: e._id,
        studentName,
        email,
        phone,
        status: 'ACTIVE'
      };
    });

    return res.status(200).json({
      success: true,
      message: "Get class students successfully",
      data: mappedStudents
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// @desc    Lấy danh sách lịch học
// @route   GET /api/admin/schedules
// @access  Private (Admin)
// ============================================================
const getSchedules = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status && status !== 'ALL') {
      query.status = status.toLowerCase();
    }

    const schedules = await Schedule.find(query)
      .populate('classId', 'name')
      .populate({
        path: 'teacherId',
        populate: { path: 'userId', select: 'name' }
      });

    const mappedSchedules = schedules.map(s => {
      const className = s.classId ? s.classId.name : 'Unknown';
      const teacherName = (s.teacherId && s.teacherId.userId) ? s.teacherId.userId.name : 'Unknown';

      return {
        _id: s._id,
        class: className,
        teacher: teacherName,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        room: s.room || 'TBD',
        status: s.status.toUpperCase()
      };
    });

    let result = mappedSchedules;
    if (search) {
      const q = search.toLowerCase();
      result = mappedSchedules.filter(s =>
        s.class.toLowerCase().includes(q) ||
        s.teacher.toLowerCase().includes(q) ||
        s.room.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      message: "Get schedules successfully",
      data: result
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// @desc    Tạo lịch học mới
// @route   POST /api/admin/schedules
// @access  Private (Admin)
// ============================================================
const createSchedule = async (req, res) => {
  try {
    const { class: className, teacher: teacherName, dayOfWeek, startTime, endTime, room, status } = req.body;

    const foundClass = await Class.findOne({ name: className });
    if (!foundClass) {
      return res.status(404).json({ success: false, message: `Class '${className}' not found` });
    }

    const foundUser = await User.findOne({ name: teacherName, role: 'teacher' });
    if (!foundUser) {
      return res.status(404).json({ success: false, message: `Teacher user '${teacherName}' not found` });
    }
    const foundTeacherProfile = await TeacherProfile.findOne({ userId: foundUser._id });
    if (!foundTeacherProfile) {
      return res.status(404).json({ success: false, message: `Teacher profile not found for '${teacherName}'` });
    }

    const schedule = await Schedule.create({
      classId: foundClass._id,
      teacherId: foundTeacherProfile._id,
      dayOfWeek: String(dayOfWeek),
      startTime,
      endTime,
      room,
      status: status.toLowerCase()
    });

    const responseData = {
      _id: schedule._id,
      class: foundClass.name,
      teacher: foundUser.name,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      room: schedule.room,
      status: status || 'ACTIVE'
    };

    return res.status(201).json({
      success: true,
      message: "Create schedule successfully",
      data: responseData
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// @desc    Cap nhat thong tin User (Edit)
// @route   PATCH /api/admin/users/:userId
// @access  Private (Admin)
// ============================================================
const updateUser = async (req, res) => {
  try {
    const { fullName, email, phone, role } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: "Email already exists" });
      }
      user.email = email;
    }

    if (fullName) user.name = fullName;
    
    const oldRole = user.role;
    if (role) {
      user.role = role.toLowerCase();
    }

    await user.save();

    const newRole = user.role;
    if (oldRole !== newRole) {
      // Delete old profile
      if (oldRole === 'teacher') {
        await TeacherProfile.deleteOne({ userId: user._id });
      } else if (oldRole === 'student') {
        await StudentProfile.deleteOne({ userId: user._id });
      }

      // Create new profile
      if (newRole === 'teacher') {
        await TeacherProfile.create({
          userId: user._id,
          specialization: [],
          experienceYears: 0,
          phoneNumber: phone || ''
        });
      } else if (newRole === 'student') {
        await StudentProfile.create({
          userId: user._id,
          parentPhone: phone || '',
          parentName: '',
          grade: '',
          school: ''
        });
      }
    } else {
      // Update phone in existing profile
      if (newRole === 'teacher') {
        await TeacherProfile.findOneAndUpdate(
          { userId: user._id },
          { phoneNumber: phone || '' },
          { upsert: true }
        );
      } else if (newRole === 'student') {
        await StudentProfile.findOneAndUpdate(
          { userId: user._id },
          { parentPhone: phone || '' },
          { upsert: true }
        );
      }
    }

    const feUser = await mapUserToFE(user);
    return res.status(200).json({
      success: true,
      message: "Update user details successfully",
      data: feUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// @desc    Xoa User
// @route   DELETE /api/admin/users/:userId
// @access  Private (Admin)
// ============================================================
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Delete profiles
    if (user.role === 'teacher') {
      await TeacherProfile.deleteOne({ userId: user._id });
    } else if (user.role === 'student') {
      await StudentProfile.deleteOne({ userId: user._id });
    }

    await User.deleteOne({ _id: user._id });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboard,
  getUsers,
  getUserDetail,
  createUser,
  updateUserStatus,
  updateUser,
  deleteUser,
  getClasses,
  getClassDetail,
  createClass,
  getClassStudents,
  getSchedules,
  createSchedule
};
