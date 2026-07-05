const express = require('express');
const multer = require('multer');
const { uploadSubjectFiles, getAllSubjects, createSubject, updateSubject, deleteSubject, deleteSubjectFile } = require('../controllers/subject.controller');

const router = express.Router();

// Setup multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/subjects/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Routes
router.get('/', getAllSubjects);
router.post('/', createSubject);
router.put('/:id', updateSubject);
router.delete('/:id', deleteSubject);
router.delete('/:id/file', deleteSubjectFile);

// Upload files for a specific subject
router.post(
  '/:id/upload',
  upload.fields([
    { name: 'syllabus', maxCount: 1 },
    { name: 'materials', maxCount: 10 }
  ]),
  uploadSubjectFiles
);

module.exports = router;
