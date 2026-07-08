const Enrollment = require('../models/Enrollment');
const Class = require('../models/Class');
const User = require('../models/User');
const Invoice = require('../models/Invoice');

// 1. Student registers for a class
exports.registerClass = async (req, res, next) => {
  try {
    const { studentId, classId } = req.body;

    const classExists = await Class.findById(classId).populate('subjectId');
    if (!classExists) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    // Check if already enrolled or pending
    const existingEnrollment = await Enrollment.findOne({ studentId, classId });
    if (existingEnrollment) {
      return res.status(400).json({ 
        success: false, 
        message: `Student already has a ${existingEnrollment.status} enrollment for this class` 
      });
    }

    // Create Enrollment with PENDING status
    const enrollment = await Enrollment.create({
      studentId,
      classId,
      status: 'PENDING'
    });

    // Automatically create an Invoice (UNPAID)
    const tuitionFee = classExists.subjectId.defaultTuitionFee || 0;
    await Invoice.create({
      studentId,
      classId: classExists._id,
      enrollmentId: enrollment._id,
      amount: tuitionFee,
      totalAmount: tuitionFee,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
      status: 'UNPAID'
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Waiting for payment approval.',
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
};

// 2. Admin/System approves the enrollment (After payment)
exports.approveEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const enrollment = await Enrollment.findById(id).populate('classId');
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    if (enrollment.status === 'APPROVED') {
      return res.status(400).json({ success: false, message: 'Enrollment is already approved' });
    }

    const targetClass = enrollment.classId;

    // Check capacity
    const currentStudentsCount = await Enrollment.countDocuments({ 
      classId: targetClass._id, 
      status: 'APPROVED' 
    });

    if (currentStudentsCount >= targetClass.maxStudents) {
      return res.status(400).json({ 
        success: false, 
        message: 'Class is full. Cannot approve enrollment.' 
      });
    }

    enrollment.status = 'APPROVED';
    await enrollment.save();

    // Emit realtime event
    const io = require('../services/socket.service').getIO();
    io.emit('enrollment_approved', {
      studentId: enrollment.studentId,
      classId: enrollment.classId._id,
      message: `Your enrollment for class ${targetClass.name} has been approved.`
    });

    res.status(200).json({
      success: true,
      message: 'Enrollment approved. Student is assigned to the class.',
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllEnrollments = async (req, res, next) => {
  try {
    const { search, classId, date, status } = req.query;
    let query = {};

    if (classId) {
      query.classId = classId;
    }
    
    if (status) {
      query.status = status;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.enrollmentDate = { $gte: startOfDay, $lte: endOfDay };
    }

    if (search) {
      const users = await User.find({ name: { $regex: search, $options: 'i' } }).select('_id');
      const userIds = users.map(u => u._id);
      query.studentId = { $in: userIds };
    }

    const enrollments = await Enrollment.find(query)
      .populate('studentId', 'name email')
      .populate({
        path: 'classId',
        select: 'name subjectId',
        populate: {
          path: 'subjectId',
          select: 'name'
        }
      })
      .sort({ enrollmentDate: -1 });

    res.status(200).json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    next(error);
  }
};

exports.updateEnrollmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['PENDING', 'APPROVED', 'CANCELLED'].includes(status)) {
       return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const enrollment = await Enrollment.findById(id).populate('classId');
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    if (enrollment.status === status) {
      return res.status(400).json({ success: false, message: `Enrollment is already ${status}` });
    }

    if (status === 'APPROVED') {
        const targetClass = enrollment.classId;
        const currentStudentsCount = await Enrollment.countDocuments({ 
          classId: targetClass._id, 
          status: 'APPROVED' 
        });

        if (currentStudentsCount >= targetClass.maxStudents) {
          return res.status(400).json({ 
            success: false, 
            message: 'Class is full. Cannot approve enrollment.' 
          });
        }
    }

    enrollment.status = status;
    await enrollment.save();

    // Liên kết Enrollment ↔ Invoice: cập nhật Invoice khi enrollment thay đổi
    if (status === 'CANCELLED') {
      // Cancel invoice tương ứng (chỉ cancel nếu chưa PAID)
      await Invoice.updateMany(
        { enrollmentId: id, status: { $in: ['UNPAID', 'PARTIAL'] } },
        { status: 'CANCELLED' }
      );
    }

    res.status(200).json({
      success: true,
      message: `Enrollment status updated to ${status}`,
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
};