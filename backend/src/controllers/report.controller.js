const mongoose = require('mongoose');
const Enrollment = require('../models/Enrollment');
const Invoice = require('../models/Invoice');
const Session = require('../models/Session');
const xlsx = require('xlsx');

// Trend Analysis: Biểu đồ thể hiện số lượng tuyển sinh tăng/giảm theo từng tháng
exports.getEnrollmentTrends = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const pipeline = [
      {
        $match: {
          enrollmentDate: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31T23:59:59.999Z`)
          }
        }
      },
      {
        $group: {
          _id: { $month: "$enrollmentDate" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ];

    const trends = await Enrollment.aggregate(pipeline);

    // Format data to have all 12 months even if 0
    const formattedData = Array.from({ length: 12 }, (_, i) => {
      const monthData = trends.find(t => t._id === i + 1);
      return {
        month: i + 1,
        enrollments: monthData ? monthData.count : 0
      };
    });

    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    next(error);
  }
};

// Export Revenue Report to Excel
exports.exportRevenueReport = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const pipeline = [
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31T23:59:59.999Z`)
          },
          status: 'PAID'
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalRevenue: { $sum: "$totalAmount" },
          invoiceCount: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ];

    const revenueData = await Invoice.aggregate(pipeline);

    const dataForExcel = revenueData.map(item => ({
      Month: `Month ${item._id}`,
      TotalRevenue_VND: item.totalRevenue,
      PaidInvoices: item.invoiceCount
    }));

    if (dataForExcel.length === 0) {
      dataForExcel.push({ Month: 'No Data', TotalRevenue_VND: 0, PaidInvoices: 0 });
    }

    const worksheet = xlsx.utils.json_to_sheet(dataForExcel);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Revenue Report');

    const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    res.setHeader('Content-Disposition', `attachment; filename="revenue_report_${year}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};
