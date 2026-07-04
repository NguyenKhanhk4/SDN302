const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const teacherRoutes = require('./routes/teacher.routes');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}


// Basic Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the SDN302 Backend API!',
    version: '1.0.0'
  });
});

const dataRoutes = require('./routes/data.routes');
const subjectRoutes = require('./routes/subject.routes');
const enrollmentRoutes = require('./routes/enrollment.routes');
const sessionRoutes = require('./routes/session.routes');
const financeRoutes = require('./routes/finance.routes');
const reportRoutes = require('./routes/report.routes');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/subject', subjectRoutes);
app.use('/api/enrollment', enrollmentRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/report', reportRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'API Route Not Found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
