const User = require('../models/User');
const TeacherProfile = require('../models/TeacherProfile');
const StudentProfile = require('../models/StudentProfile');
const ParentProfile = require('../models/ParentProfile');

// @desc    Get current user profile
// @route   GET /api/profile/me
// @access  Private
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    let profile = null;

    if (user.role === 'teacher') {
      profile = await TeacherProfile.findOne({ userId: user._id });
    } else if (user.role === 'student') {
      profile = await StudentProfile.findOne({ userId: user._id });
    } else if (user.role === 'parent') {
      profile = await ParentProfile.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      message: 'Get profile successfully',
      data: {
        user: {
          _id: user._id,
          fullName: user.name, // mapping name to fullName for frontend
          email: user.email,
          phone: user.phone || '',
          role: user.role.toUpperCase(), // frontend uses uppercase
          status: user.isActive ? 'ACTIVE' : 'INACTIVE',
          address: user.address || '',
          dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : '',
          gender: user.gender || ''
        },
        profile
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// @desc    Update current user profile
// @route   PUT /api/profile/me
// @access  Private
exports.updateMyProfile = async (req, res) => {
  try {
    const { fullName, phone, address, dateOfBirth, gender } = req.body;

    if (!fullName) {
      return res.status(400).json({ success: false, message: 'Tên không được để trống' });
    }

    if (gender && !['MALE', 'FEMALE', 'OTHER'].includes(gender)) {
      return res.status(400).json({ success: false, message: 'Giới tính không hợp lệ' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: fullName, // mapping fullName back to name
        phone,
        address,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Update profile successfully',
      data: {
        user: {
          _id: updatedUser._id,
          fullName: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone || '',
          role: updatedUser.role.toUpperCase(),
          status: updatedUser.isActive ? 'ACTIVE' : 'INACTIVE',
          address: updatedUser.address || '',
          dateOfBirth: updatedUser.dateOfBirth ? updatedUser.dateOfBirth.toISOString().split('T')[0] : '',
          gender: updatedUser.gender || ''
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// @desc    Clear current user optional profile info
// @route   PATCH /api/profile/me/clear
// @access  Private
exports.clearMyProfile = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        phone: '',
        address: '',
        dateOfBirth: null,
        $unset: { gender: 1 } // Completely remove gender or set to null
      },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Clear profile information successfully',
      data: {
        user: {
          _id: updatedUser._id,
          fullName: updatedUser.name,
          email: updatedUser.email,
          phone: '',
          role: updatedUser.role.toUpperCase(),
          status: updatedUser.isActive ? 'ACTIVE' : 'INACTIVE',
          address: '',
          dateOfBirth: '',
          gender: ''
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
