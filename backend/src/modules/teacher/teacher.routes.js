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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/sessions/';
    if (!fs.existsSync(dir)) {
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

router.use(protect, authorize('teacher'));

router.get('/dashboard', getTeacherDashboard);
router.get('/subjects', getMySubjects);
router.get('/classes', getMyClasses);
router.get('/classes/:classId', getMyClassDetail);
router.get('/classes/:classId/students', getStudentsInMyClass);
router.get('/schedules', getMySchedules);
router.get('/classes/:classId/sessions', getSessionsByClass);
router.post('/classes/:classId/sessions', createSession);
router.get('/classes/:classId/sessions/:sessionId/attendance', getAttendanceBySession);
router.post('/classes/:classId/sessions/:sessionId/attendance', takeAttendance);
router.post(
  '/classes/:classId/sessions/:sessionId/upload',
  upload.array('materials', 10),
  uploadSessionMaterials
);
router.delete('/classes/:classId/sessions/:sessionId/file', deleteSessionMaterial);

module.exports = router;
