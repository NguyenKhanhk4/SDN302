const express = require('express');
const { getEnrollmentTrends, exportRevenueReport, getAdvancedStatistics } = require('../controllers/report.controller');

const router = express.Router();

router.get('/trends/enrollment', getEnrollmentTrends);
router.get('/export/revenue', exportRevenueReport);
router.get('/statistics', getAdvancedStatistics);

module.exports = router;
