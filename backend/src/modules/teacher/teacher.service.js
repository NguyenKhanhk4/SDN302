const TeacherProfile = require('../../models/TeacherProfile');
const Class = require('../../models/Class');
const ClassStudent = require('../../models/ClassStudent');

const getTeacherProfileByUserId = async (userId) => {
  const teacherProfile = await TeacherProfile.findOne({ userId });
  if (!teacherProfile) {
    throw new Error('Teacher profile not found');
  }
  return teacherProfile;
};

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

const getActiveStudentsInClass = async (classId) => {
  return await ClassStudent.find({ classId, status: 'enrolled' })
    .populate({
      path: 'studentId',
      populate: {
        path: 'userId',
        select: 'name email phone',
      },
    });
};

module.exports = {
  getTeacherProfileByUserId,
  checkTeacherOwnsClass,
  getActiveStudentsInClass,
};
