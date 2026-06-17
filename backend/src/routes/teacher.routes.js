const express = require('express');
const router = express.Router();

const {
  getTeacherDashboard,
  getMyClasses,
  getMyClassDetail,
  getStudentsInMyClass,
  getMySchedules,
} = require('../controllers/teacher.controller');

const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

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

module.exports = router;
