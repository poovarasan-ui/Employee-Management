const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
require('dotenv').config();

const seedAttendanceAndLeaves = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/employee-management';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for attendance seeding...');

    // Fetch existing employees
    const employees = await Employee.find().limit(5);
    if (employees.length === 0) {
      console.log('No employees found to attach attendance to.');
      process.exit(0);
    }

    const primaryEmp = employees[0];
    const secondEmp = employees[1] || employees[0];

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed

    // Generate sample attendance records for primary employee across the current month
    const sampleAttendances = [];
    const daysInMonthSoFar = today.getDate();

    for (let day = 1; day < daysInMonthSoFar; day++) {
      const dateObj = new Date(currentYear, currentMonth, day);
      const dayOfWeek = dateObj.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      const isHalfDay = day % 7 === 0;
      const hours = isHalfDay ? 4.0 : 8.5;
      const formatted = isHalfDay ? '4h 00m' : '8h 30m';
      const status = isHalfDay ? 'Half Day' : 'Present';

      const clockInTime = new Date(dateObj);
      clockInTime.setHours(9, 15, 0);

      const clockOutTime = new Date(dateObj);
      clockOutTime.setHours(isHalfDay ? 13 : 17, isHalfDay ? 15 : 45, 0);

      sampleAttendances.push({
        employee: primaryEmp._id,
        employee_id: primaryEmp.employee_id,
        employee_name: primaryEmp.name,
        department: primaryEmp.department,
        date: dateStr,
        clockIn: clockInTime,
        clockOut: clockOutTime,
        workHours: hours,
        workHoursFormatted: formatted,
        status,
        notes: isHalfDay ? 'Left early for doctor appointment' : 'Regular office shift'
      });
    }

    // Insert or update sample attendance
    for (const att of sampleAttendances) {
      await Attendance.findOneAndUpdate(
        { employee_id: att.employee_id, date: att.date },
        att,
        { upsert: true }
      );
    }

    // Also create 1 clocked-in record for today for second employee
    const todayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(daysInMonthSoFar).padStart(2, '0')}`;
    const todayClockIn = new Date();
    todayClockIn.setHours(9, 30, 0);

    await Attendance.findOneAndUpdate(
      { employee_id: secondEmp.employee_id, date: todayStr },
      {
        employee: secondEmp._id,
        employee_id: secondEmp.employee_id,
        employee_name: secondEmp.name,
        department: secondEmp.department,
        date: todayStr,
        clockIn: todayClockIn,
        status: 'Clocked In',
        notes: 'In office at Desk 4B'
      },
      { upsert: true }
    );

    // Create 3 sample leave requests
    const leaves = [
      {
        employee: primaryEmp._id,
        employee_id: primaryEmp.employee_id,
        employee_name: primaryEmp.name,
        department: primaryEmp.department,
        leaveType: 'Casual Leave',
        startDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-20`,
        endDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-22`,
        days: 3,
        reason: 'Family wedding event in hometown.',
        status: 'Pending'
      },
      {
        employee: secondEmp._id,
        employee_id: secondEmp.employee_id,
        employee_name: secondEmp.name,
        department: secondEmp.department,
        leaveType: 'Sick Leave',
        startDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-02`,
        endDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-03`,
        days: 2,
        reason: 'Viral fever and prescribed medical rest.',
        status: 'Approved',
        adminComment: 'Get well soon! Medical certificate received.',
        reviewedBy: 'Admin'
      },
      {
        employee: primaryEmp._id,
        employee_id: primaryEmp.employee_id,
        employee_name: primaryEmp.name,
        department: primaryEmp.department,
        leaveType: 'Annual Leave',
        startDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-12`,
        endDate: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-14`,
        days: 3,
        reason: 'Vacation travel.',
        status: 'Pending'
      }
    ];

    for (const lv of leaves) {
      const exists = await Leave.findOne({ employee_id: lv.employee_id, startDate: lv.startDate });
      if (!exists) {
        await Leave.create(lv);
      }
    }

    console.log('Successfully seeded Attendance & Leave records!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding attendance:', err);
    process.exit(1);
  }
};

seedAttendanceAndLeaves();
