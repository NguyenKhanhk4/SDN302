const express = require('express');
const { createSession, substituteTeacher } = require('../controllers/session.controller');

const router = express.Router();

router.post('/', createSession);
router.put('/:id/substitute', substituteTeacher);

module.exports = router;
