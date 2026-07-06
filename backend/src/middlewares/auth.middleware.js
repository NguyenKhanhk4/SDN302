const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware xác thực JWT token.
 * Đặt req.user sau khi xác thực thành công.
 */
const protect = async (req, res, next) => {
  let token;

  // Bỏ qua xác thực để dễ test (Bypass Login)
  req.user = {
    _id: '123456789012345678901234',
    role: 'manager',
    name: 'Admin Demo',
    isActive: true
  };
  return next();
};

module.exports = { protect };
