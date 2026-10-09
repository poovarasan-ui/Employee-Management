const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
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
    leaveType: {
      type: String,
      enum: ['Casual Leave', 'Sick Leave', 'Annual Leave', 'Maternity/Paternity Leave', 'Emergency Leave'],
      required: [true, 'Leave type is required']
    },
    startDate: {
      type: String, // 'YYYY-MM-DD'
      required: [true, 'Start date is required']
    },
    endDate: {
      type: String, // 'YYYY-MM-DD'
      required: [true, 'End date is required']
    },
    days: {
      type: Number,
      required: [true, 'Number of days is required'],
      default: 1
    },
    reason: {
      type: String,
      required: [true, 'Reason for leave is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    adminComment: {
      type: String,
      default: '',
      trim: true
    },
    reviewedBy: {
      type: String,
      default: ''
    },
    reviewedAt: {
      type: Date
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Leave', leaveSchema);
