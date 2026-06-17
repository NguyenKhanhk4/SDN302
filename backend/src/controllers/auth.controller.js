const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ============================================================
// @desc    Dang nhap va lay JWT token
// @route   POST /api/auth/login
// @access  Public
// ============================================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui long nhap email va mat khau',
      });
    }

    // Tim user theo email, lay kem password de so sanh
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoac mat khau khong dung',
      });
    }

    // So sanh password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoac mat khau khong dung',
      });
    }

    // Kiem tra tai khoan con active khong
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Tai khoan da bi vo hieu hoa',
      });
    }

    // Ky JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Dang nhap thanh cong',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { login };
