const Session = require('../models/Session');
const { checkConflict } = require('../services/conflict.service');

// Create a new session
exports.createSession = async (req, res, next) => {
  try {
    const { classId, teacherId, room, startTime, endTime, sessionDate, topic } = req.body;

    // Check conflict
    const conflictResult = await checkConflict(teacherId, room, startTime, endTime);
    if (conflictResult.hasConflict) {
      return res.status(409).json({
        success: false,
        message: conflictResult.reason,
        conflictDetails: conflictResult.conflictWith
      });
    }

    const session = await Session.create({
      classId,
      teacherId,
      room,
      startTime,
      endTime,
      sessionDate,
      topic
    });

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// Change teacher for a session (Substitute Teacher)
exports.substituteTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newTeacherId } = req.body;

    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Check conflict for new teacher (we only care about teacher conflict here, room is the same)
    const conflictResult = await checkConflict(newTeacherId, session.room, session.startTime, session.endTime, id);
    if (conflictResult.hasConflict) {
      return res.status(409).json({
        success: false,
        message: 'The substitute teacher has a schedule conflict.',
        conflictDetails: conflictResult.conflictWith
      });
    }

    // Assign substitute
    session.originalTeacherId = session.teacherId; // Save original
    session.teacherId = newTeacherId;
    await session.save();

    res.status(200).json({
      success: true,
      message: 'Substitute teacher assigned successfully',
      data: session
    });
  } catch (error) {
    next(error);
  }
};
