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

exports.getAdvancedStatistics = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const Payroll = require('../models/Payroll');
    
    // 1. Revenue vs Expense per month
    const revenuePipeline = [
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
          totalRevenue: { $sum: "$totalAmount" }
        }
      }
    ];

    const expensePipeline = [
      {
        $match: {
          year: year
        }
      },
      {
        $group: {
          _id: "$month",
          totalExpense: { $sum: "$totalAmount" }
        }
      }
    ];

    const [revenueData, expenseData] = await Promise.all([
      Invoice.aggregate(revenuePipeline),
      Payroll.aggregate(expensePipeline)
    ]);

    const revenueVsExpense = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const rev = revenueData.find(r => r._id === month);
      const exp = expenseData.find(e => e._id === month);
      return {
        month: `Th ${month}`,
        revenue: rev ? rev.totalRevenue : 0,
        expense: exp ? exp.totalExpense : 0
      };
    });

    let totalRevenue = 0;
    let totalExpense = 0;
    revenueVsExpense.forEach(item => {
      totalRevenue += item.revenue;
      totalExpense += item.expense;
    });
    const netProfit = totalRevenue - totalExpense;

    // 2. Top Subjects
    const topSubjectsPipeline = [
      {
        $group: {
          _id: "$classId",
          studentCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'classes',
          localField: '_id',
          foreignField: '_id',
          as: 'classDetails'
        }
      },
      { $unwind: "$classDetails" },
      {
        $group: {
          _id: "$classDetails.subjectId",
          studentCount: { $sum: "$studentCount" }
        }
      },
      { $sort: { studentCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'subjects',
          localField: '_id',
          foreignField: '_id',
          as: 'subjectDetails'
        }
      },
      { $unwind: "$subjectDetails" },
      {
        $project: {
          name: "$subjectDetails.name",
          students: "$studentCount"
        }
      }
    ];
    const topSubjects = await Enrollment.aggregate(topSubjectsPipeline);

    // 3. Tính toán Fill Rate (Tỷ lệ lấp đầy)
    const Class = require('../models/Class');
    const activeClasses = await Class.find({ status: { $in: ['ongoing', 'scheduled'] } });
    let totalCapacity = 0;
    let totalEnrolled = 0;

    for (const c of activeClasses) {
      totalCapacity += c.maxStudents || 20;
      const enrolledCount = await Enrollment.countDocuments({ classId: c._id, status: 'APPROVED' });
      totalEnrolled += enrolledCount;
    }
    const fillRate = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

    // 4. Tính toán Attendance Rate (Tỷ lệ chuyên cần)
    const Attendance = require('../models/Attendance');
    const totalAttendances = await Attendance.countDocuments();
    const totalPresent = await Attendance.countDocuments({ status: 'PRESENT' });
    const attendanceRate = totalAttendances > 0 ? Math.round((totalPresent / totalAttendances) * 100) : 0;

    // 5. Build KPIs
    const kpis = {
      totalRevenue,
      totalExpense,
      netProfit,
      fillRate, 
      attendanceRate 
    };

    res.status(200).json({
      success: true,
      data: {
        kpis,
        revenueVsExpense,
        topSubjects
      }
    });

  } catch (error) {
    next(error);
  }
};
