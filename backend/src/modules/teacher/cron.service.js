const cron = require('node-cron');
const Invoice = require('../models/Invoice');

// Schedule a job to run every day at 00:00 (Midnight)
exports.startCronJobs = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Running daily debt tracking check...');
    try {
      const now = new Date();
      // Find unpaid or partial invoices that are past due date
      const overdueInvoices = await Invoice.find({
        status: { $in: ['UNPAID', 'PARTIAL'] },
        dueDate: { $lt: now }
      }).populate('studentId');

      if (overdueInvoices.length > 0) {
        console.log(`[Cron] Found ${overdueInvoices.length} overdue invoices.`);
        // In a real application, you would send emails or push notifications here.
        // For example:
        // overdueInvoices.forEach(invoice => {
        //   sendNotification(invoice.studentId, 'Your tuition fee is overdue!');
        // });
      } else {
        console.log('[Cron] No overdue invoices found today.');
      }
    } catch (error) {
      console.error('[Cron] Error during debt tracking:', error);
    }
  });
  
  console.log('Cron jobs scheduled.');
};
