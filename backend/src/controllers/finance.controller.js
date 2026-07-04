const Invoice = require('../models/Invoice');
const Receipt = require('../models/Receipt');
const Session = require('../models/Session');
const Payroll = require('../models/Payroll');
const Attendance = require('../models/Attendance');

// 1. Pay Invoice (Create Receipt)
exports.payInvoice = async (req, res, next) => {
  try {
    const { id } = req.params; // Invoice ID
    const { amountPaid, paymentMethod, transactionId, notes } = req.body;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (invoice.status === 'PAID') {
      return res.status(400).json({ success: false, message: 'Invoice is already fully paid' });
    }

    // Check how much has been paid so far
    const receipts = await Receipt.find({ invoiceId: id });
    const totalPaidAlready = receipts.reduce((sum, r) => sum + r.amountPaid, 0);
    
    const newTotalPaid = totalPaidAlready + amountPaid;
    
    if (newTotalPaid >= invoice.totalAmount) {
      invoice.status = 'PAID';
    } else {
      invoice.status = 'PARTIAL';
    }

    await invoice.save();

    const receipt = await Receipt.create({
      invoiceId: invoice._id,
      studentId: invoice.studentId,
      amountPaid,
      paymentMethod,
      transactionId,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: {
        invoice,
        receipt
      }
    });
  } catch (error) {
    next(error);
  }
};

// 2. Calculate Payroll for a Teacher
exports.calculatePayroll = async (req, res, next) => {
  try {
    const { teacherId, month, year } = req.body;
    
    // We want to find all COMPLETED sessions for this teacher in the given month/year
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const sessions = await Session.find({
      teacherId,
      status: 'COMPLETED',
      sessionDate: { $gte: startDate, $lte: endDate }
    });

    // Basic calculation logic: 200,000 VND per session
    const RATE_PER_SESSION = 200000;
    
    let totalSessions = 0;
    let baseAmount = 0;
    const details = [];

    for (const session of sessions) {
      // In a real app, you might check Attendance model to see if teacher actually checked in
      // For now, we count COMPLETED sessions
      totalSessions++;
      baseAmount += RATE_PER_SESSION;
      details.push({
        sessionId: session._id,
        amount: RATE_PER_SESSION
      });
    }

    // Bonus logic can be added here (e.g., from feedback ratings)
    const bonusAmount = 0; 
    const totalAmount = baseAmount + bonusAmount;

    // Create or update Payroll
    const payroll = await Payroll.findOneAndUpdate(
      { teacherId, month, year },
      {
        totalSessions,
        baseAmount,
        bonusAmount,
        totalAmount,
        details,
        status: 'DRAFT'
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Payroll calculated successfully',
      data: payroll
    });

  } catch (error) {
    next(error);
  }
};

exports.getAllInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find().populate('studentId', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    next(error);
  }
};

exports.getAllPayrolls = async (req, res, next) => {
  try {
    const payrolls = await Payroll.find().populate('teacherId', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: payrolls });
  } catch (error) {
    next(error);
  }
};
