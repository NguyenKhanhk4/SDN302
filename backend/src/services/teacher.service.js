const TeacherProfile = require('../models/TeacherProfile');
const Class = require('../models/Class');
const ClassStudent = require('../models/ClassStudent');

/**
 * Tìm TeacherProfile theo userId.
 * Nếu không tồn tại thì throw error "Teacher profile not found".
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
const getTeacherProfileByUserId = async (userId) => {
  const teacherProfile = await TeacherProfile.findOne({ userId });
  if (!teacherProfile) {
    throw new Error('Teacher profile not found');
  }
  return teacherProfile;
};

/**
 * Kiểm tra class có teacherId đúng với teacher đang đăng nhập hay không.
 * Nếu không đúng thì throw error "You are not assigned to this class".
 * @param {string} teacherId 
 * @param {string} classId 
 * @returns {Promise<boolean>}
 */
const checkTeacherOwnsClass = async (teacherId, classId) => {
  const classroom = await Class.findById(classId);
  if (!classroom) {
    throw new Error('Class not found');
  }
  
  if (classroom.teacherId.toString() !== teacherId.toString()) {
    throw new Error('You are not assigned to this class');
  }
  
  return true;
};

/**
 * Lấy danh sách học viên đang active (enrolled) trong lớp.
 * Populate thông tin studentId.userId gồm name, email.
 * @param {string} classId 
 * @returns {Promise<Array>}
 */
const getActiveStudentsInClass = async (classId) => {
  return await ClassStudent.find({ classId, status: 'enrolled' })
    .populate({
      path: 'studentId',
      populate: {
        path: 'userId',
        select: 'name email phone', // Lấy name (fullName), email, phone từ User model
      },
    });
};

module.exports = {
  getTeacherProfileByUserId,
  checkTeacherOwnsClass,
  getActiveStudentsInClass,
};
