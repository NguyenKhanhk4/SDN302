const express = require('express');
const router = express.Router();

const {
  getTeacherDashboard,
  getMyClasses,
  getMyClassDetail,
  getStudentsInMyClass,
  getMySchedules,
  getSessionsByClass,
  createSession,
  getAttendanceBySession,
  takeAttendance,
} = require('./teacher.controller');

const { protect } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');

// Áp dụng protect + authorize('teacher') cho toàn bộ routes bên dưới
router.use(protect, authorize('teacher'));

// GET /api/teacher/dashboard
router.get('/dashboard', getTeacherDashboard);

// GET /api/teacher/classes
router.get('/classes', getMyClasses);

// GET /api/teacher/classes/:classId
router.get('/classes/:classId', getMyClassDetail);

// GET /api/teacher/classes/:classId/students
router.get('/classes/:classId/students', getStudentsInMyClass);

// GET /api/teacher/schedules
router.get('/schedules', getMySchedules);

// GET /api/teacher/classes/:classId/sessions
router.get('/classes/:classId/sessions', getSessionsByClass);

// POST /api/teacher/classes/:classId/sessions
router.post('/classes/:classId/sessions', createSession);

// GET /api/teacher/classes/:classId/sessions/:sessionId/attendance
router.get('/classes/:classId/sessions/:sessionId/attendance', getAttendanceBySession);

// POST /api/teacher/classes/:classId/sessions/:sessionId/attendance
router.post('/classes/:classId/sessions/:sessionId/attendance', takeAttendance);

module.exports = router;

