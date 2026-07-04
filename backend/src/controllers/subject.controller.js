const Subject = require('../models/Subject');
const fs = require('fs');
const path = require('path');

// Upload syllabus or material for a subject
exports.uploadSubjectFiles = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ success: false, message: 'No files were uploaded.' });
    }

    // Handle syllabus upload (single file)
    if (req.files.syllabus) {
      const syllabusFile = req.files.syllabus[0];
      subject.syllabus = syllabusFile.path;
    }

    // Handle materials upload (multiple files)
    if (req.files.materials) {
      const materialPaths = req.files.materials.map(file => file.path);
      subject.materials = [...subject.materials, ...materialPaths];
    }

    await subject.save();

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      data: subject
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    next(error);
  }
};
