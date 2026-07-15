const express = require('express');
const router = express.Router();
const { login, googleLogin, googleRegister } = require('../controllers/auth.controller');

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/google
router.post('/google', googleLogin);

// POST /api/auth/google/register
router.post('/google/register', googleRegister);

module.exports = router;
