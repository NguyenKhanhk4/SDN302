const Class = require('../../models/Class');
const Schedule = require('../../models/Schedule');
const ClassStudent = require('../../models/ClassStudent');
const Session = require('../../models/Session');
const Attendance = require('../../models/Attendance');
const fs = require('fs');
const path = require('path');

const Subject = require('../../models/Subject');
require('../../models/TeacherProfile');
require('../../models/StudentProfile');

const {
  getTeacherProfileByUserId,
  checkTeacherOwnsClass,
  getActiveStudentsInClass,
} = require('./teacher.service');

const { ensureSessionsForClass } = require('./session-generation.service');


const getTeacherDashboard = async (req, res) => {
  try {
    const teacherProfile = await getTeacherProfileByUserId(req.user._id);

    const totalClasses = await Class.countDocuments({
      teacherId: teacherProfile._id,
    });

    const totalActiveSchedules = await Schedule.countDocuments({
      teacherId: teacherProfile._id,
      status: 'active',
    });

    const myClasses = await Class.find(
      { teacherId: teacherProfile._id },
      '_id'
    );
    const classIds = myClasses.map((c) => c._id);

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

const getMyClasses = async (req, res) => {
  try {
    const teacherProfile = await getTeacherProfileByUserId(req.user._id);

    const classes = await Class.find({ teacherId: teacherProfile._id })
      .populate('subjectId', 'name gradeLevel defaultTuitionFee')
      .sort({ createdAt: -1 });

    const classIds = classes.map((classroom) => classroom._id);
    const studentCounts = await ClassStudent.aggregate([
      {
        $match: {
          classId: { $in: classIds },
          status: 'enrolled',
        },
      },
      {
        $group: {
          _id: '$classId',
          count: { $sum: 1 },
        },
      },
    ]);

    const studentCountByClassId = new Map(
      studentCounts.map(({ _id, count }) => [_id.toString(), count])
    );
    const classesWithStudentCount = classes.map((classroom) => ({
      ...classroom.toObject(),
      currentStudents: studentCountByClassId.get(classroom._id.toString()) || 0,
    }));

    return res.status(200).json({
      success: true,
      total: classesWithStudentCount.length,
      data: classesWithStudentCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMyClassDetail = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherProfile = await getTeacherProfileByUserId(req.user._id);

    await checkTeacherOwnsClass(teacherProfile._id, classId);

    await ensureSessionsForClass(classId, teacherProfile._id);

    const classroom = await Class.findById(classId).populate(
      'subjectId',
      'name gradeLevel description defaultTuitionFee'
    );
    const currentStudents = await ClassStudent.countDocuments({
      classId,
      status: 'enrolled',
    });

    return res.status(200).json({
      success: true,
      data: {
        ...classroom.toObject(),
        currentStudents,
      },
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

const getStudentsInMyClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherProfile = await getTeacherProfileByUserId(req.user._id);

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

const getMySchedules = async (req, res) => {
  try {
    const teacherProfile = await getTeacherProfileByUserId(req.user._id);

    const activeClasses = await Class.find({
      teacherId: teacherProfile._id,
      status: 'ongoing',
    }).select('_id');
    const activeClassIds = activeClasses.map((classroom) => classroom._id);

    await Promise.all(
      activeClassIds.map((classId) => ensureSessionsForClass(classId, teacherProfile._id))
    );

    const schedules = await Schedule.find({
      teacherId: teacherProfile._id,
      classId: { $in: activeClassIds },
      status: 'active',
    })
      .populate('classId', 'name room status startDate endDate')
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

const getSessionsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherProfile = await getTeacherProfileByUserId(req.user._id);

    await checkTeacherOwnsClass(teacherProfile._id, classId);

    await ensureSessionsForClass(classId, teacherProfile._id);

    const sessions = await Session.find({ classId })
      .populate('scheduleId')
      .populate('classId')
      .sort({ sessionDate: 1 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
            total: totalEnrolled,
            recorded,
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

    const startOfDay = new Date(sessionDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(sessionDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingSession = await Session.findOne({
      classId,
      sessionDate: { $gte: startOfDay, $lte: endOfDay },
    });

    if (existingSession) {
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
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Session da ton tai cho ngay nay',
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAttendanceBySession = async (req, res) => {
  try {
    const { classId, sessionId } = req.params;
    const teacherProfile = await getTeacherProfileByUserId(req.user._id);

    await checkTeacherOwnsClass(teacherProfile._id, classId);

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

const takeAttendance = async (req, res) => {
  try {
    const { classId, sessionId } = req.params;
    const { attendances } = req.body;
    const teacherProfile = await getTeacherProfileByUserId(req.user._id);

    await checkTeacherOwnsClass(teacherProfile._id, classId);

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

    const results = [];
    for (const att of attendances) {
      if (!att.status) {
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

const getMySubjects = async (req, res) => {
  try {
    const teacherProfile = await getTeacherProfileByUserId(req.user._id);

    const myClasses = await Class.find({
      teacherId: teacherProfile._id,
      status: { $in: ['upcoming', 'in_progress'] },
    });

    const subjectIds = myClasses.map(c => c.subjectId);

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

    const filePaths = req.files.map(file => file.path);
    session.materials = [...(session.materials || []), ...filePaths];
    await session.save();

    return res.status(200).json({
      success: true,
      message: 'Upload materials successfully',
      data: session
    });
  } catch (error) {
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

    session.materials = session.materials.filter(m => m !== fileUrl);
    await session.save();

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
