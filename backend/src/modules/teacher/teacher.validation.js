const { ATTENDANCE_STATUS } = require('./teacher.constants');

const isValidAttendanceStatus = (status) => {
  return Object.values(ATTENDANCE_STATUS).includes(status);
};

module.exports = {
  isValidAttendanceStatus
};
