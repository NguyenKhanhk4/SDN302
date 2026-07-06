// Chức năng của Manager: Định tuyến toàn bộ API endpoint cho role Manager
const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const {
  getManagerDashboard,
  getManagerStudents,
  getManagerStudentDetail,
  createManagerStudent,
  updateManagerStudent,
  deleteManagerStudent,
  getManagerParents,
  getManagerParentDetail,
  createManagerParent,
  getManagerParentStudents,
  linkManagerParentStudent,
  getManagerTeachers,
  getManagerTeacherDetail,
  updateManagerTeacher,
  deleteManagerTeacher,
  getManagerSubjects,
  createManagerSubject,
  getManagerSubjectDetail,
  updateManagerSubject,
  deleteManagerSubject,
  getManagerClasses,
  getManagerClassDetail,
  createManagerClass,
  updateManagerClass,
  deleteManagerClass,
  getManagerClassStudents,
  addManagerStudentToClass,
  getManagerSchedules,
  createManagerSchedule,
  getManagerScheduleDetail,
  updateManagerSchedule,
  deleteManagerSchedule,
  getManagerInvoices,
  createManagerInvoice,
  getManagerInvoiceDetail,
  updateManagerInvoice,
  deleteManagerInvoice,
  markManagerInvoicePaid,
} = require('../controllers/manager.controller');

// Tất cả routes đều yêu cầu JWT + role MANAGER
router.use(protect, authorize('manager'));

// Dashboard
router.get('/dashboard', getManagerDashboard);

// Students
router.get('/students', getManagerStudents);
router.get('/students/:studentId', getManagerStudentDetail);
router.post('/students', createManagerStudent);
router.put('/students/:studentId', updateManagerStudent);
router.delete('/students/:studentId', deleteManagerStudent);

// Parents
router.get('/parents', getManagerParents);
router.get('/parents/:parentId', getManagerParentDetail);
router.post('/parents', createManagerParent);
router.get('/parents/:parentId/students', getManagerParentStudents);
router.post('/parents/:parentId/students', linkManagerParentStudent);

// Teachers
router.get('/teachers', getManagerTeachers);
router.get('/teachers/:teacherId', getManagerTeacherDetail);
router.put('/teachers/:teacherId', updateManagerTeacher);
router.delete('/teachers/:teacherId', deleteManagerTeacher);

// Subjects
router.get('/subjects', getManagerSubjects);
router.get('/subjects/:subjectId', getManagerSubjectDetail);
router.post('/subjects', createManagerSubject);
router.put('/subjects/:subjectId', updateManagerSubject);
router.delete('/subjects/:subjectId', deleteManagerSubject);

// Classes
router.get('/classes', getManagerClasses);
router.get('/classes/:classId', getManagerClassDetail);
router.post('/classes', createManagerClass);
router.put('/classes/:classId', updateManagerClass);
router.delete('/classes/:classId', deleteManagerClass);
router.get('/classes/:classId/students', getManagerClassStudents);
router.post('/classes/:classId/students', addManagerStudentToClass);

// Schedules
router.get('/schedules', getManagerSchedules);
router.get('/schedules/:scheduleId', getManagerScheduleDetail);
router.post('/schedules', createManagerSchedule);
router.put('/schedules/:scheduleId', updateManagerSchedule);
router.delete('/schedules/:scheduleId', deleteManagerSchedule);

// Invoices
router.get('/invoices', getManagerInvoices);
router.get('/invoices/:invoiceId', getManagerInvoiceDetail);
router.post('/invoices', createManagerInvoice);
router.put('/invoices/:invoiceId', updateManagerInvoice);
router.delete('/invoices/:invoiceId', deleteManagerInvoice);
router.patch('/invoices/:invoiceId/pay', markManagerInvoicePaid);

module.exports = router;
