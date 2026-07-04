const express = require('express');
const { registerClass, approveEnrollment, getAllEnrollments } = require('../controllers/enrollment.controller');

const router = express.Router();

router.get('/', getAllEnrollments);
router.post('/register', registerClass);
router.put('/:id/approve', approveEnrollment);

module.exports = router;
