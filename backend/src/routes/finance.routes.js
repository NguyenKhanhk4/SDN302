const express = require('express');
const { payInvoice, calculatePayroll, getAllInvoices, getAllPayrolls, calculateAllPayrolls } = require('../controllers/finance.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

// Tất cả routes yêu cầu đăng nhập + quyền admin hoặc manager
router.use(protect);

router.get('/invoices', authorize('admin', 'manager'), getAllInvoices);
router.get('/payrolls', authorize('admin', 'manager'), getAllPayrolls);

router.post('/invoice/:id/pay', authorize('admin', 'manager'), payInvoice);
router.post('/payroll/calculate', authorize('admin'), calculatePayroll);
router.post('/payroll/calculate-all', authorize('admin'), calculateAllPayrolls);

module.exports = router;

