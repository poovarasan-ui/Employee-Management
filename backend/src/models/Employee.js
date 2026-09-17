const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    employee_id: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Employee Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Employee Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true
    },
    salary: {
      type: String,
      required: [true, 'Salary is required'],
      trim: true,
      match: [/^\d+(\.\d+)?(\s*-\s*\d+(\.\d+)?)?$/, 'Salary must be a number or LPA range']
    },
    joining_date: {
      type: Date,
      required: [true, 'Joining Date is required']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Employee', employeeSchema);
