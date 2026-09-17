const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve uploaded images from backend/uploads (one directory up from src)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Employee Management API is running perfectly!'
  });
});

module.exports = app;