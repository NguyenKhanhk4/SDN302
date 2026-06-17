/**
 * Middleware kiểm tra quyền theo role.
 * Phải dùng sau middleware `protect`.
 *
 * Cách dùng: authorize('admin', 'teacher')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Chưa xác thực. Vui lòng dùng middleware protect trước.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Vai trò '${req.user.role}' không có quyền thực hiện hành động này.`,
      });
    }

    next();
  };
};

module.exports = { authorize };
