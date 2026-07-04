const Session = require('../models/Session');

/**
 * Checks if a session conflicts with any existing sessions.
 * @param {string} teacherId - The ID of the teacher
 * @param {string} roomId - The ID/name of the room
 * @param {Date} startTime - Session start time
 * @param {Date} endTime - Session end time
 * @param {string} excludeSessionId - ID of the session to exclude (for updates)
 * @returns {Promise<Object>} Result object with conflict status and details
 */
exports.checkConflict = async (teacherId, roomId, startTime, endTime, excludeSessionId = null) => {
  const query = {
    $or: [
      { teacherId: teacherId },
      { room: roomId }
    ],
    // Conflict logic: (StartA < EndB) AND (EndA > StartB)
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
    status: { $ne: 'CANCELLED' }
  };

  if (excludeSessionId) {
    query._id = { $ne: excludeSessionId };
  }

  const conflictingSession = await Session.findOne(query).populate('classId');

  if (conflictingSession) {
    let reason = '';
    if (conflictingSession.teacherId.toString() === teacherId.toString()) {
      reason = 'Teacher is already scheduled for another class during this time.';
    } else {
      reason = 'Room is already booked for another class during this time.';
    }

    return {
      hasConflict: true,
      reason,
      conflictWith: conflictingSession
    };
  }

  return { hasConflict: false };
};
