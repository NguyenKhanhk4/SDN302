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
    const { search } = req.query;
    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    const subjects = await Subject.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    next(error);
  }
};

exports.createSubject = async (req, res, next) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

exports.updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.status(200).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

exports.deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.status(200).json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.deleteSubjectFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fileUrl, fileType } = req.body;

    const subject = await Subject.findById(id);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });

    if (fileType === 'syllabus') {
      subject.syllabus = '';
    } else if (fileType === 'materials') {
      subject.materials = subject.materials.filter(m => m !== fileUrl);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid fileType' });
    }

    await subject.save();
    
    try {
      if (fileUrl && fs.existsSync(fileUrl)) {
        fs.unlinkSync(fileUrl);
      }
    } catch (e) {
      console.error('Error deleting file from disk', e);
    }

    res.status(200).json({ success: true, message: 'File deleted successfully', data: subject });
  } catch (error) {
    next(error);
  }
};
