const fs = require('fs');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const User = require('../models/User');
const Class = require('../models/Class');

// Import Users from CSV or Excel
exports.importUsers = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const results = [];
    const filePath = req.file.path;

    if (req.file.mimetype === 'text/csv') {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          await processImportedUsers(results, res, filePath);
        });
    } else {
      // Handle Excel
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);
      await processImportedUsers(data, res, filePath);
    }
  } catch (error) {
    next(error);
  }
};

const processImportedUsers = async (data, res, filePath) => {
  try {
    let importedCount = 0;
    let failedCount = 0;
    const errors = [];

    for (const [index, row] of data.entries()) {
      try {
        if (!row.name || !row.email || !row.password) {
          throw new Error('Missing required fields (name, email, password)');
        }

        const existingUser = await User.findOne({ email: row.email });
        if (existingUser) {
          throw new Error('Email already exists');
        }

        await User.create({
          name: row.name,
          email: row.email,
          password: row.password,
          role: row.role || 'student', // default to student if not provided
        });
        importedCount++;
      } catch (err) {
        failedCount++;
        errors.push(`Row ${index + 2}: ${err.message}`); // +2 because index is 0-based and row 1 is header
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: `Import completed. ${importedCount} successful, ${failedCount} failed.`,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Export Users to Excel
exports.exportUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    
    // Convert Mongoose documents to plain objects
    const data = users.map(user => ({
      ID: user._id.toString(),
      Name: user.name,
      Email: user.email,
      Role: user.role,
      IsActive: user.isActive ? 'Yes' : 'No',
      CreatedAt: user.createdAt.toISOString(),
    }));

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Users');

    const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    res.setHeader('Content-Disposition', 'attachment; filename="users_export.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};
