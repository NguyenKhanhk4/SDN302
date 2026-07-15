const express = require('express');
const router = express.Router();

const {
  getChildren,
  getChildSchedules,
  getChildGrades,
  getChildTeachers,
  getChildClasses,
  getStudentsInClassForParent,
  getParentProfile,
  linkChild,
} = require('../controllers/parent.controller');

const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

// Áp dụng protect + authorize('parent') cho toàn bộ routes bên dưới
router.use(protect, authorize('parent'));

// GET /api/parent/children - Xem thông tin các con
router.get('/children', getChildren);

// POST /api/parent/children/link - Tự liên kết thêm con em bằng email
router.post('/children/link', linkChild);

// GET /api/parent/profile - Xem thông tin hồ sơ phụ huynh
router.get('/profile', getParentProfile);

// GET /api/parent/children/:childId/schedules - Xem lịch học của con
router.get('/children/:childId/schedules', getChildSchedules);

// GET /api/parent/children/:childId/grades - Xem điểm của con
router.get('/children/:childId/grades', getChildGrades);

// GET /api/parent/children/:childId/teachers - Xem danh sách giáo viên dạy con
router.get('/children/:childId/teachers', getChildTeachers);

// GET /api/parent/children/:childId/classes - Xem danh sách lớp học con đang học
router.get('/children/:childId/classes', getChildClasses);

// GET /api/parent/classes/:classId/students - Xem danh sách học viên trong lớp
router.get('/classes/:classId/students', getStudentsInClassForParent);

module.exports = router;
