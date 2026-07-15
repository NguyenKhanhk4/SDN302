const express = require('express');
const router = express.Router();

const {
  getDashboard,
  getAnalytics,
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
  createSchedule,
  updateUserPassword
} = require('../controllers/admin.controller');

const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

// Protect all routes below with protect + authorize('admin')
router.use(protect, authorize('admin'));

// Dashboard & Analytics routes
router.get('/dashboard', getDashboard);
router.get('/analytics', getAnalytics);

// User routes
router.get('/users', getUsers);
router.post('/users', createUser);
router.get('/users/:userId', getUserDetail);
router.patch('/users/:userId/status', updateUserStatus);
router.patch('/users/:userId/password', updateUserPassword);
router.patch('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);

// Class routes
router.get('/classes', getClasses);
router.post('/classes', createClass);
router.get('/classes/:classId', getClassDetail);
router.get('/classes/:classId/students', getClassStudents);

// Schedule routes
router.get('/schedules', getSchedules);
router.post('/schedules', createSchedule);

module.exports = router;
