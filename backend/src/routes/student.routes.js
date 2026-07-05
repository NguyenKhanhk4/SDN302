const express = require('express');
const router = express.Router();
const { getStudentDashboard, getMyClasses, getStudentSessions, getStudentInvoices, getSupportRequests, createSupportRequest } = require('../controllers/student.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

// Protect all routes under /api/student and restrict to 'student' role
router.use(protect, authorize('student'));

// GET /api/student/dashboard
router.get('/dashboard', getStudentDashboard);

// GET /api/student/classes
router.get('/classes', getMyClasses);

// GET /api/student/sessions
router.get('/sessions', getStudentSessions);

// GET /api/student/invoices
router.get('/invoices', getStudentInvoices);

// GET & POST /api/student/support
router.get('/support', getSupportRequests);
router.post('/support', createSupportRequest);

module.exports = router;
