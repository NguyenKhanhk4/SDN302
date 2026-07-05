const express = require('express');
const expressRouter = require('express').Router;
const router = expressRouter();
const { 
  getMyProfile, 
  updateMyProfile, 
  clearMyProfile,
  changePassword,
  updateAvatar
} = require('../controllers/profile.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect); // Tat ca routes đeu can đăng nhap

router.route('/me')
  .get(getMyProfile)
  .put(updateMyProfile);

router.patch('/me/clear', clearMyProfile);

router.put('/me/password', changePassword);
router.put('/me/avatar', updateAvatar);

module.exports = router;
