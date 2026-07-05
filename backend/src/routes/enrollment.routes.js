const express = require('express');
const { registerClass, approveEnrollment, getAllEnrollments, updateEnrollmentStatus } = require('../controllers/enrollment.controller');

const router = express.Router();

router.get('/', getAllEnrollments);
router.post('/register', registerClass);
router.put('/:id/approve', approveEnrollment);
router.put('/:id/status', updateEnrollmentStatus);

module.exports = router;
