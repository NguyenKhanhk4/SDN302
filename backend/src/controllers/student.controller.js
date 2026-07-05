const StudentProfile = require('../models/StudentProfile');
const ClassStudent = require('../models/ClassStudent');
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');
const Invoice = require('../models/Invoice');
const Announcement = require('../models/Announcement');
const User = require('../models/User');

const Class = require('../models/Class');
const Schedule = require('../models/Schedule');
const SupportRequest = require('../models/SupportRequest');

// Register models for populate
require('../models/Subject');

/**
 * @desc    Lay thong tin Dashboard cho hoc sinh
 * @route   GET /api/student/dashboard
 * @access  Private (Student)
 */
const getStudentDashboard = async (req, res) => {
  try {
    // 1. Tim Student Profile lien ket voi User
    const student = await StudentProfile.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ học sinh tương ứng với tài khoản này.',
      });
    }

    // 2. Lay so lop hoc dang tham gia
    const classCount = await ClassStudent.countDocuments({
      studentId: student._id,
      status: 'enrolled',
    });

    // 3. Lay danh sach lop dang tham gia de query buoi hoc tiep theo
    const classStudents = await ClassStudent.find({
      studentId: student._id,
      status: 'enrolled',
    });
    const classIds = classStudents.map((cs) => cs.classId);

    // 4. Lay 5 buoi hoc sap toi (tu ngay hom nay tro di, status la SCHEDULED)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Tinh tu dau ngay hom nay
    
    const upcomingSessions = await Session.find({
      classId: { $in: classIds },
      sessionDate: { $gte: today },
      status: 'SCHEDULED',
    })
      .populate('classId', 'name room')
      .sort({ sessionDate: 1 })
      .limit(5);

    // 5. Thong ke ty le diem danh
    const totalAttendance = await Attendance.countDocuments({
      studentId: student._id,
    });
    const present = await Attendance.countDocuments({
      studentId: student._id,
      status: 'PRESENT',
    });
    const late = await Attendance.countDocuments({
      studentId: student._id,
      status: 'LATE',
    });
    const excused = await Attendance.countDocuments({
      studentId: student._id,
      status: 'EXCUSED',
    });
    const absent = await Attendance.countDocuments({
      studentId: student._id,
      status: 'ABSENT',
    });

    // Ty le = (Present + Late + Excused) / Total. Mac dinh 100% neu chua co record nao
    const rate = totalAttendance > 0 
      ? Math.round(((present + late + excused) / totalAttendance) * 100)
      : 100;

    // 6. Tinh hoc phi con no va danh sach hoa don chua thanh toan
    const unpaidInvoices = await Invoice.find({
      studentId: student._id,
      status: { $ne: 'PAID' },
    })
      .populate('classId', 'name')
      .sort({ dueDate: 1 });

    const remainingAmount = unpaidInvoices.reduce(
      (sum, inv) => sum + (inv.amount - inv.paidAmount),
      0
    );

    // 7. Xem cac thong bao moi nhat
    const announcements = await Announcement.find({
      targetRole: { $in: ['ALL', 'STUDENT'] },
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // Format du lieu tra ve dong nhat voi controller profile
    return res.status(200).json({
      success: true,
      message: 'Lấy dữ liệu bảng điều khiển thành công',
      data: {
        profile: {
          user: {
            _id: req.user._id,
            fullName: req.user.name,
            email: req.user.email,
            phone: req.user.phone || '',
            role: req.user.role.toUpperCase(),
            status: req.user.isActive ? 'ACTIVE' : 'INACTIVE',
            address: req.user.address || '',
            dateOfBirth: req.user.dateOfBirth ? req.user.dateOfBirth.toISOString().split('T')[0] : '',
            gender: req.user.gender || '',
          },
          student,
        },
        classCount,
        upcomingSessions,
        attendanceStats: {
          rate,
          present,
          late,
          excused,
          absent,
          total: totalAttendance,
        },
        tuition: {
          remainingAmount,
          unpaidInvoices,
        },
        announcements,
      },
    });
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu bảng điều khiển học sinh:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.',
      error: error.message,
    });
  }
};

/**
 * @desc    Lay danh sach lop hoc cua hoc sinh
 * @route   GET /api/student/classes
 * @access  Private (Student)
 */
const getMyClasses = async (req, res) => {
  try {
    // 1. Tim Student Profile lien ket voi User
    const student = await StudentProfile.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ học sinh tương ứng với tài khoản này.',
      });
    }

    // 2. Lay danh sach lop dang tham gia
    const classStudents = await ClassStudent.find({
      studentId: student._id,
      status: 'enrolled',
    });
    const classIds = classStudents.map((cs) => cs.classId);

    // 3. Lay thong tin lop hoc, populate mon hoc va giang vien
    const classes = await Class.find({ _id: { $in: classIds } })
      .populate('subjectId', 'name code description')
      .populate({
        path: 'teacherId',
        populate: {
          path: 'userId',
          select: 'name email avatar phone',
        },
      });

    // 4. Lay lich hoc cua cac lop
    const schedules = await Schedule.find({
      classId: { $in: classIds },
      status: 'active',
    });

    // 5. Ghep lich hoc vao tung lop
    const classesWithSchedules = classes.map((cls) => {
      const classSchedules = schedules.filter(
        (sched) => sched.classId.toString() === cls._id.toString()
      );
      return {
        _id: cls._id,
        name: cls.name,
        room: cls.room,
        maxStudents: cls.maxStudents,
        totalSessions: cls.totalSessions,
        startDate: cls.startDate,
        endDate: cls.endDate,
        status: cls.status,
        subject: cls.subjectId,
        teacher: cls.teacherId ? {
          _id: cls.teacherId._id,
          specialization: cls.teacherId.specialization,
          experienceYears: cls.teacherId.experienceYears,
          bio: cls.teacherId.bio,
          name: cls.teacherId.userId?.name || 'Chưa phân công',
          email: cls.teacherId.userId?.email || '',
          avatar: cls.teacherId.userId?.avatar || '',
          phone: cls.teacherId.userId?.phone || cls.teacherId.phoneNumber || '',
        } : null,
        schedules: classSchedules.map(sched => ({
          _id: sched._id,
          dayOfWeek: sched.dayOfWeek,
          startTime: sched.startTime,
          endTime: sched.endTime,
          room: sched.room || cls.room,
        })),
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách lớp học thành công',
      data: classesWithSchedules,
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách lớp học của học sinh:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.',
      error: error.message,
    });
  }
};

/**
 * @desc    Lay danh sach cac buoi hoc (sessions) cua hoc sinh
 * @route   GET /api/student/sessions
 * @access  Private (Student)
 */
const getStudentSessions = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // 1. Tim Student Profile
    const student = await StudentProfile.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ học sinh tương ứng với tài khoản này.',
      });
    }

    // 2. Lay cac lop hoc dang tham gia
    const classStudents = await ClassStudent.find({
      studentId: student._id,
      status: 'enrolled',
    });
    const classIds = classStudents.map((cs) => cs.classId);

    // 3. Xay dung query lay sessions
    let query = { classId: { $in: classIds } };

    if (startDate || endDate) {
      query.sessionDate = {};
      if (startDate) {
        query.sessionDate.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.sessionDate.$lte = end;
      }
    }

    // 4. Query sessions va populate lop hoc, mon hoc, va lich hoc co dinh
    const sessions = await Session.find(query)
      .populate({
        path: 'classId',
        select: 'name room teacherId subjectId',
        populate: [
          {
            path: 'subjectId',
            select: 'name code'
          },
          {
            path: 'teacherId',
            populate: {
              path: 'userId',
              select: 'name email phone'
            }
          }
        ]
      })
      .populate('scheduleId')
      .sort({ sessionDate: 1 });

    // 4.5. Query attendances of this student
    const attendances = await Attendance.find({ studentId: student._id });
    const attendanceMap = new Map();
    attendances.forEach(att => {
      attendanceMap.set(att.sessionId.toString(), {
        status: att.status,
        note: att.note || '',
      });
    });

    // 5. Format response
    const formattedSessions = sessions.map((sess) => {
      const cls = sess.classId;
      const sched = sess.scheduleId;
      const att = attendanceMap.get(sess._id.toString()) || null;
      return {
        _id: sess._id,
        sessionDate: sess.sessionDate,
        topic: sess.topic,
        status: sess.status,
        class: cls ? {
          _id: cls._id,
          name: cls.name,
          room: cls.room,
          subject: cls.subjectId?.name || '',
          teacherName: cls.teacherId?.userId?.name || 'Chưa phân công',
        } : null,
        schedule: sched ? {
          _id: sched._id,
          startTime: sched.startTime,
          endTime: sched.endTime,
        } : null,
        attendance: att,
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Lấy lịch học thành công',
      data: formattedSessions,
    });
  } catch (error) {
    console.error('Lỗi khi lấy lịch học của học sinh:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.',
      error: error.message,
    });
  }
};

/**
 * @desc    Lay danh sach hoa don hoc phi cua hoc sinh
 * @route   GET /api/student/invoices
 * @access  Private (Student)
 */
const getStudentInvoices = async (req, res) => {
  try {
    // 1. Tim Student Profile
    const student = await StudentProfile.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ học sinh tương ứng với tài khoản này.',
      });
    }

    // 2. Lay danh sach hoa don va populate thong tin lop hoc, mon hoc
    const invoices = await Invoice.find({ studentId: student._id })
      .populate({
        path: 'classId',
        select: 'name room subjectId',
        populate: {
          path: 'subjectId',
          select: 'name defaultTuitionFee'
        }
      })
      .sort({ month: -1 });

    // 3. Format response
    const formattedInvoices = invoices.map(inv => {
      const cls = inv.classId;
      return {
        _id: inv._id,
        amount: inv.amount,
        paidAmount: inv.paidAmount,
        month: inv.month,
        dueDate: inv.dueDate,
        status: inv.status,
        note: inv.note,
        updatedAt: inv.updatedAt,
        class: cls ? {
          _id: cls._id,
          name: cls.name,
          subjectName: cls.subjectId?.name || 'Môn học',
        } : null
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách hóa đơn thành công',
      data: formattedInvoices,
    });
  } catch (error) {
    console.error('Lỗi khi lấy hóa đơn học phí của học sinh:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.',
      error: error.message,
    });
  }
};

/**
 * @desc    Lay danh sach yeu cau ho tro cua hoc sinh
 * @route   GET /api/student/support
 * @access  Private (Student)
 */
const getSupportRequests = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ học sinh tương ứng với tài khoản này.',
      });
    }

    const requests = await SupportRequest.find({ studentId: student._id })
      .populate('classId', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách yêu cầu hỗ trợ thành công',
      data: requests,
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách hỗ trợ của học sinh:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.',
      error: error.message,
    });
  }
};

/**
 * @desc    Tao yeu cau ho tro moi (nghi hoc, phan hoi, lien he)
 * @route   POST /api/student/support
 * @access  Private (Student)
 */
const createSupportRequest = async (req, res) => {
  try {
    const { type, title, content, classId, sessionDate } = req.body;

    if (!type || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Loại yêu cầu, tiêu đề và nội dung là bắt buộc.',
      });
    }

    if (!['LEAVE', 'FEEDBACK', 'CONTACT'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Loại yêu cầu không hợp lệ. Phải là LEAVE, FEEDBACK hoặc CONTACT.',
      });
    }

    const student = await StudentProfile.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ học sinh tương ứng với tài khoản này.',
      });
    }

    const newRequest = await SupportRequest.create({
      studentId: student._id,
      type,
      title,
      content,
      classId: classId || null,
      sessionDate: sessionDate ? new Date(sessionDate) : null,
      status: 'PENDING',
    });

    return res.status(201).json({
      success: true,
      message: 'Gửi yêu cầu hỗ trợ thành công.',
      data: newRequest,
    });
  } catch (error) {
    console.error('Lỗi khi tạo yêu cầu hỗ trợ:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.',
      error: error.message,
    });
  }
};

module.exports = {
  getStudentDashboard,
  getMyClasses,
  getStudentSessions,
  getStudentInvoices,
  getSupportRequests,
  createSupportRequest,
};
