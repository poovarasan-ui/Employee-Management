const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    employee_id: {
      type: String,
      required: [true, 'Employee ID is required'],
      trim: true
    },
    employee_name: {
      type: String,
      required: [true, 'Employee name is required'],
      trim: true
    },
    department: {
      type: String,
      default: ''
    },
    date: {
      type: String, // 'YYYY-MM-DD'
      required: [true, 'Date string (YYYY-MM-DD) is required'],
      trim: true
    },
    clockIn: {
      type: Date
    },
    clockOut: {
      type: Date
    },
    workHours: {
      type: Number,
      default: 0 // Duration in decimal hours, e.g., 8.5
    },
    workHoursFormatted: {
      type: String,
      default: '' // e.g. "8h 30m"
    },
    status: {
      type: String,
      enum: ['Clocked In', 'Present', 'Half Day', 'Absent', 'On Leave', 'Holiday'],
      default: 'Clocked In'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Ensure an employee has at most one attendance record per day
attendanceSchema.index({ employee_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
