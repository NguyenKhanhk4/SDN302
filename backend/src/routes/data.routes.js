const express = require('express');
const multer = require('multer');
const { importUsers, exportUsers } = require('../controllers/data.controller');

const router = express.Router();

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Routes
router.post('/import-users', upload.single('file'), importUsers);
router.get('/export-users', exportUsers);

module.exports = router;
