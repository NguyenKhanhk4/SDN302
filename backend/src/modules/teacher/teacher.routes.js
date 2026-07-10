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
  getMySubjects,
  uploadSessionMaterials,
  deleteSessionMaterial,
} = require('./teacher.controller');

const multer = require('multer');
const fs = require('fs');

// Setup multer storage for sessions
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/sessions/';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

const { protect } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');

// Áp dụng protect + authorize('teacher') cho toàn bộ routes bên dưới
router.use(protect, authorize('teacher'));

// GET /api/teacher/dashboard
router.get('/dashboard', getTeacherDashboard);

// GET /api/teacher/subjects
router.get('/subjects', getMySubjects);

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

// Upload files for a specific session
router.post(
  '/classes/:classId/sessions/:sessionId/upload',
  upload.array('materials', 10),
  uploadSessionMaterials
);

// Delete file from a specific session
router.delete('/classes/:classId/sessions/:sessionId/file', deleteSessionMaterial);

module.exports = router;

