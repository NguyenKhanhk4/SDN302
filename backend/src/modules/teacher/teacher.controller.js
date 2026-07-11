const Class = require('../../models/Class');
const Schedule = require('../../models/Schedule');
const ClassStudent = require('../../models/ClassStudent');
const Session = require('../../models/Session');
const Attendance = require('../../models/Attendance');
const fs = require('fs');
const path = require('path');

// Phai require cac model duoc dung trong populate()
// de Mongoose dang ky schema truoc khi query
const Subject = require('../../models/Subject');
require('../../models/TeacherProfile');
require('../../models/StudentProfile');

const {
  getTeacherProfileByUserId,
  checkTeacherOwnsClass,
  getActiveStudentsInClass,
} = require('./teacher.service');

const { ensureSessionsForClass } = require('./session-generation.service');


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

// ============================================================
// @desc    Teacher xem danh sach buoi hoc (sessions) cua mot lop
// @route   GET /api/teacher/classes/:classId/sessions
// @access  Private (Teacher)
// ============================================================
const getSessionsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherProfile = await getTeacherProfileByUserId(req.user._id);

    await checkTeacherOwnsClass(teacherProfile._id, classId);

    // Tu dong sinh session theo lich co dinh (neu chua co)
    await ensureSessionsForClass(classId, teacherProfile._id);

    const sessions = await Session.find({ classId })
      .populate('scheduleId')
      .populate('classId')
      .sort({ sessionDate: 1 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Lay danh sach studentId dang enrolled trong lop (nguon chuan)
    const enrolledStudents = await ClassStudent.find({ classId, status: 'enrolled' }).select('studentId');
    const enrolledStudentIds = enrolledStudents.map(cs => cs.studentId.toString());
    const totalEnrolled = enrolledStudentIds.length;

    const dataWithStatus = await Promise.all(
      sessions.map(async (session) => {
        let attendanceStatus = 'NOT_YET';

        const sessionDate = new Date(session.sessionDate);
        sessionDate.setHours(0, 0, 0, 0);

        if (session.status === 'CANCELLED') {
          attendanceStatus = 'CANCELLED';
        } else if (session.status === 'COMPLETED') {
          attendanceStatus = 'COMPLETED';
        } else if (sessionDate > today) {
          attendanceStatus = 'FUTURE';
        } else {
          attendanceStatus = 'NOT_YET';
        }

        // Chi lay attendance cua cac hoc vien DANG enrolled trong lop
        const attendances = await Attendance.find({
          sessionId: session._id,
          studentId: { $in: enrolledStudents.map(cs => cs.studentId) }
        });

        const recorded = attendances.length;
        if (recorded > 0) {
          attendanceStatus = 'COMPLETED';
        }

        const present = attendances.filter(a => a.status === 'PRESENT').length;
        const absent = attendances.filter(a => a.status === 'ABSENT').length;

        return {
          ...session.toObject(),
          attendanceStatus,
          attendanceSummary: {
            total: totalEnrolled,  // Tong so hoc vien dang enrolled
            recorded,              // So hoc vien DA duoc ghi diem danh (chi tinh enrolled)
            present,
            absent,
          },
        };
      })
    );

    return res.status(200).json({
      success: true,
      total: dataWithStatus.length,
      data: dataWithStatus,
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
// @desc    Teacher tao buoi hoc moi cho mot lop
// @route   POST /api/teacher/classes/:classId/sessions
// @access  Private (Teacher)
// ============================================================
const createSession = async (req, res) => {
  try {
    const { classId } = req.params;
    const { sessionDate, topic, scheduleId, teacherId, room, startTime, endTime } = req.body;
    const teacherProfile = await getTeacherProfileByUserId(req.user._id);

    await checkTeacherOwnsClass(teacherProfile._id, classId);

    if (!sessionDate) {
      return res.status(400).json({
        success: false,
        message: 'sessionDate la bat buoc',
      });
    }

    // Kiem tra session da ton tai cho ngay nay chua
    const startOfDay = new Date(sessionDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(sessionDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingSession = await Session.findOne({
      classId,
      sessionDate: { $gte: startOfDay, $lte: endOfDay },
    });

    if (existingSession) {
      // Tra ve session da ton tai thay vi tao moi
      return res.status(200).json({
        success: true,
        message: 'Session da ton tai cho ngay nay',
        data: existingSession,
      });
    }

    const session = await Session.create({
      classId,
      scheduleId: scheduleId || undefined,
      sessionDate: new Date(sessionDate),
      topic: topic || '',
      status: 'SCHEDULED',
      teacherId: teacherId || teacherProfile._id,
      room: room || 'Chưa xếp',
      startTime: startTime || new Date(sessionDate),
      endTime: endTime || new Date(sessionDate)
    });

    return res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error) {
    if (error.message === 'You are not assigned to this class') {
      return res.status(403).json({ success: false, message: error.message });
    }
    if (error.message === 'Class not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    // Handle duplicate key error from the unique index
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Session da ton tai cho ngay nay',
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// @desc    Teacher xem diem danh cua mot buoi hoc
// @route   GET /api/teacher/classes/:classId/sessions/:sessionId/attendance
// @access  Private (Teacher)
// ============================================================
const getAttendanceBySession = async (req, res) => {
  try {
    const { classId, sessionId } = req.params;
    const teacherProfile = await getTeacherProfileByUserId(req.user._id);

    await checkTeacherOwnsClass(teacherProfile._id, classId);

    // Kiem tra session thuoc class nay
    const session = await Session.findOne({ _id: sessionId, classId });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found in this class',
      });
    }

    const attendances = await Attendance.find({ sessionId })
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'name email phone',
        },
      });

    return res.status(200).json({
      success: true,
      total: attendances.length,
      data: attendances,
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
// @desc    Teacher diem danh cho mot buoi hoc
// @route   POST /api/teacher/classes/:classId/sessions/:sessionId/attendance
// @access  Private (Teacher)
// ============================================================
const takeAttendance = async (req, res) => {
  try {
    const { classId, sessionId } = req.params;
    const { attendances } = req.body;
    const teacherProfile = await getTeacherProfileByUserId(req.user._id);

    await checkTeacherOwnsClass(teacherProfile._id, classId);

    // Kiem tra session thuoc class nay
    const session = await Session.findOne({ _id: sessionId, classId });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found in this class',
      });
    }

    if (!attendances || !Array.isArray(attendances)) {
      return res.status(400).json({
        success: false,
        message: 'attendances phai la mot mang',
      });
    }

    // Upsert or delete tung ban ghi attendance
    const results = [];
    for (const att of attendances) {
      if (!att.status) {
        // Neu status bi huy chon (null), xoa ban ghi diem danh neu co
        await Attendance.findOneAndDelete({ sessionId, studentId: att.studentId });
        continue;
      }

      const result = await Attendance.findOneAndUpdate(
        { sessionId, studentId: att.studentId },
        {
          sessionId,
          studentId: att.studentId,
          status: att.status,
          note: att.note || '',
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      results.push(result);
    }

    // Cap nhat trang thai session thanh COMPLETED sau khi diem danh
    session.status = 'COMPLETED';
    await session.save();

    return res.status(200).json({
      success: true,
      total: results.length,
      data: results,
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
// @desc    Lay danh sach mon hoc (Subject) ma teacher dang day
// @route   GET /api/teacher/subjects
// @access  Private (Teacher)
// ============================================================
const getMySubjects = async (req, res) => {
  try {
    const teacherProfile = await getTeacherProfileByUserId(req.user._id);

    // Lay cac lop ma giao vien dang day
    const myClasses = await Class.find({
      teacherId: teacherProfile._id,
      status: { $in: ['upcoming', 'in_progress'] },
    });

    const subjectIds = myClasses.map(c => c.subjectId);

    // Tim cac mon hoc duy nhat
    const { search } = req.query;
    let query = { _id: { $in: subjectIds } };
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const subjects = await Subject.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: subjects.length,
      data: subjects,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// @desc    Upload documents/materials for a specific session
// @route   POST /api/teacher/classes/:classId/sessions/:sessionId/upload
// @access  Private (Teacher)
// ============================================================
const uploadSessionMaterials = async (req, res) => {
  try {
    const { classId, sessionId } = req.params;
    const teacherProfile = await getTeacherProfileByUserId(req.user._id);

    await checkTeacherOwnsClass(teacherProfile._id, classId);

    const session = await Session.findOne({ _id: sessionId, classId });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found in this class' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    // Luu file paths vao materials array
    const filePaths = req.files.map(file => file.path);
    session.materials = [...(session.materials || []), ...filePaths];
    await session.save();

    return res.status(200).json({
      success: true,
      message: 'Upload materials successfully',
      data: session
    });
  } catch (error) {
    // Xoa file da upload neu bi loi DB
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error("Error deleting file:", file.path, err);
        });
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// @desc    Delete a material from a specific session
// @route   DELETE /api/teacher/classes/:classId/sessions/:sessionId/file
// @access  Private (Teacher)
// ============================================================
const deleteSessionMaterial = async (req, res) => {
  try {
    const { classId, sessionId } = req.params;
    const { fileUrl } = req.body;
    
    if (!fileUrl) {
      return res.status(400).json({ success: false, message: 'fileUrl is required' });
    }

    const teacherProfile = await getTeacherProfileByUserId(req.user._id);
    await checkTeacherOwnsClass(teacherProfile._id, classId);

    const session = await Session.findOne({ _id: sessionId, classId });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found in this class' });
    }

    // Xoa url khoi DB
    session.materials = session.materials.filter(m => m !== fileUrl);
    await session.save();

    // Xoa file vat ly
    const filePath = path.resolve(process.cwd(), fileUrl);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Loi khi xoa file:", filePath, err);
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Deleted material successfully',
      data: session
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
  getSessionsByClass,
  createSession,
  getAttendanceBySession,
  takeAttendance,
  getMySubjects,
  uploadSessionMaterials,
  deleteSessionMaterial,
};
