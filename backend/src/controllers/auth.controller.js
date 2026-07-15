const jwt = require('jsonwebtoken');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const ParentProfile = require('../models/ParentProfile');

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

// ============================================================
// @desc    Dang nhap bang Google
// @route   POST /api/auth/google
// @access  Public
// ============================================================
const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Thieu idToken' });
    }

    let email = '';
    const admin = require('../config/firebaseAdmin');

    // Verify if firebase-admin is initialized properly
    if (admin.apps && admin.apps.length > 0) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        email = decodedToken.email;
      } catch (err) {
        return res.status(401).json({ success: false, message: 'Google Token khong hop le' });
      }
    } else {
      // Fallback/Mock for local testing when serviceAccountKey.json is missing
      console.warn('Firebase Admin not initialized, trusting client idToken for development...');
      const base64Url = idToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
      const payload = JSON.parse(jsonPayload);
      email = payload.email;
    }

    if (!email) {
      return res.status(400).json({ success: false, message: 'Khong lay duoc email tu Google' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Tra ve isNewUser = true de frontend hien popup chon Role
      return res.status(200).json({ 
        success: true, 
        isNewUser: true, 
        email: email,
        idToken: idToken // Gui lai de verify luc register
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Tai khoan da bi vo hieu hoa' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Dang nhap Google thanh cong',
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

// ============================================================
// @desc    Dang ky bang Google (khi chua co tai khoan)
// @route   POST /api/auth/google/register
// @access  Public
// ============================================================
const googleRegister = async (req, res) => {
  try {
    const { idToken, role } = req.body;
    if (!idToken || !role) {
      return res.status(400).json({ success: false, message: 'Thieu thong tin idToken hoac role' });
    }

    if (role !== 'student' && role !== 'parent') {
      return res.status(400).json({ success: false, message: 'Role khong hop le' });
    }

    let email = '';
    let name = '';
    const admin = require('../config/firebaseAdmin');

    if (admin.apps && admin.apps.length > 0) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        email = decodedToken.email;
        name = decodedToken.name || email.split('@')[0];
      } catch (err) {
        return res.status(401).json({ success: false, message: 'Google Token khong hop le' });
      }
    } else {
      const base64Url = idToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
      email = payload.email;
      name = payload.name || email.split('@')[0];
    }

    if (!email) {
      return res.status(400).json({ success: false, message: 'Khong lay duoc email tu Google' });
    }

    // Kiem tra lai xem da ton tai chua
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'Tai khoan da ton tai' });
    }

    // Tao user moi
    user = await User.create({
      name,
      email,
      password: Math.random().toString(36).slice(-8) + 'A1!', // random pass
      role,
      isActive: true, // auto active for google login
    });

    // Tao profile tuong ung
    if (role === 'student') {
      await StudentProfile.create({ userId: user._id });
    } else if (role === 'parent') {
      await ParentProfile.create({ userId: user._id });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Dang ky va dang nhap thanh cong',
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

module.exports = { login, googleLogin, googleRegister };
