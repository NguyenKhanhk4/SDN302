const express = require('express');
const { payInvoice, calculatePayroll, getAllInvoices, getAllPayrolls } = require('../controllers/finance.controller');

const router = express.Router();

router.get('/invoices', getAllInvoices);
router.get('/payrolls', getAllPayrolls);

router.post('/invoice/:id/pay', payInvoice);
router.post('/payroll/calculate', calculatePayroll);

module.exports = router;
