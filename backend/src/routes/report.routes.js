const express = require('express');
const { getEnrollmentTrends, exportRevenueReport } = require('../controllers/report.controller');

const router = express.Router();

router.get('/trends/enrollment', getEnrollmentTrends);
router.get('/export/revenue', exportRevenueReport);

module.exports = router;
