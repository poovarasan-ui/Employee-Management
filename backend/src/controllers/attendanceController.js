const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const Leave = require('../models/Leave');

// Helper to format Date to YYYY-MM-DD
const getLocalDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Clock In for today
// @route   POST /api/attendance/clock-in
// @access  Private
const clockIn = async (req, res) => {
  try {
    const { employee_id, employee_name, department } = req.body;

    if (!employee_id) {
      return res.status(400).json({ success: false, message: 'Employee ID is required.' });
    }

    const today = getLocalDateString();
    let record = await Attendance.findOne({ employee_id, date: today });

    if (record) {
      if (record.clockIn && !record.clockOut) {
        return res.status(400).json({
          success: false,
          message: `Already clocked in at ${new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} today.`
        });
      }
      if (record.clockOut) {
        return res.status(400).json({
          success: false,
          message: 'You have already completed your shift and clocked out for today.'
        });
      }
    }

    const now = new Date();
    if (!record) {
      record = new Attendance({
        employee_id,
        employee_name: employee_name || 'Employee',
        department: department || '',
        date: today,
        clockIn: now,
        status: 'Clocked In'
      });
    } else {
      record.clockIn = now;
      record.status = 'Clocked In';
    }

    await record.save();

    return res.status(200).json({
      success: true,
      message: `Clocked in successfully at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      attendance: record
    });
  } catch (error) {
    console.error('Clock-In Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during clock in.' });
  }
};

// @desc    Clock Out for today
// @route   POST /api/attendance/clock-out
// @access  Private
const clockOut = async (req, res) => {
  try {
    const { employee_id } = req.body;

    if (!employee_id) {
      return res.status(400).json({ success: false, message: 'Employee ID is required.' });
    }

    const today = getLocalDateString();
    const record = await Attendance.findOne({ employee_id, date: today });

    if (!record || !record.clockIn) {
      return res.status(400).json({
        success: false,
        message: 'No clock-in record found for today. Please clock in first.'
      });
    }

    if (record.clockOut) {
      return res.status(400).json({
        success: false,
        message: `Already clocked out today at ${new Date(record.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
      });
    }

    const now = new Date();
    const diffMs = now.getTime() - new Date(record.clockIn).getTime();
    const diffHours = Math.max(0, diffMs / (1000 * 60 * 60));
    const h = Math.floor(diffHours);
    const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const formattedHours = `${h}h ${m}m`;

    let finalStatus = 'Present';
    if (diffHours < 4) {
      finalStatus = 'Half Day';
    } else if (diffHours < 7.5) {
      finalStatus = 'Half Day';
    } else {
      finalStatus = 'Present';
    }

    record.clockOut = now;
    record.workHours = Number(diffHours.toFixed(2));
    record.workHoursFormatted = formattedHours;
    record.status = finalStatus;

    await record.save();

    return res.status(200).json({
      success: true,
      message: `Clocked out successfully at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Total shift: ${formattedHours}.`,
      attendance: record
    });
  } catch (error) {
    console.error('Clock-Out Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during clock out.' });
  }
};

// @desc    Get Today's Clock In/Out status for an employee
// @route   GET /api/attendance/today/:employee_id
// @access  Private
const getTodayStatus = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const today = getLocalDateString();

    const record = await Attendance.findOne({ employee_id, date: today });

    let isClockedIn = false;
    let isClockedOut = false;
    let elapsedMinutes = 0;

    if (record && record.clockIn) {
      if (!record.clockOut) {
        isClockedIn = true;
        const diffMs = Date.now() - new Date(record.clockIn).getTime();
        elapsedMinutes = Math.floor(diffMs / 60000);
      } else {
        isClockedOut = true;
      }
    }

    return res.status(200).json({
      success: true,
      today,
      isClockedIn,
      isClockedOut,
      attendance: record || null,
      elapsedMinutes
    });
  } catch (error) {
    console.error('Get Today Status Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all attendance logs with filters
// @route   GET /api/attendance
// @access  Private
const getAttendanceLogs = async (req, res) => {
  try {
    const { date, month, employee_id, status } = req.query;
    const filter = {};

    if (date) {
      filter.date = date;
    } else if (month) {
      filter.date = { $regex: `^${month}` }; // Matches 'YYYY-MM'
    }

    if (employee_id) {
      filter.employee_id = employee_id;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    const records = await Attendance.find(filter).sort({ date: -1, clockIn: -1 });

    return res.status(200).json({
      success: true,
      count: records.length,
      records
    });
  } catch (error) {
    console.error('Get Attendance Logs Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get monthly attendance records & heatmap data for an employee
// @route   GET /api/attendance/monthly/:employee_id
// @access  Private
const getEmployeeMonthlyAttendance = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const month = req.query.month || getLocalDateString().slice(0, 7); // e.g. '2026-10'

    // Fetch attendance records for this month
    const records = await Attendance.find({
      employee_id,
      date: { $regex: `^${month}` }
    });

    // Map records by date for easy lookup (date -> record)
    const recordsMap = {};
    let totalWorkHours = 0;
    let presentDays = 0;
    let halfDays = 0;

    records.forEach(r => {
      recordsMap[r.date] = r;
      if (r.status === 'Present') presentDays++;
      if (r.status === 'Half Day') halfDays++;
      if (r.workHours) totalWorkHours += r.workHours;
    });

    // Also fetch approved leaves in this month to display on calendar
    const leaves = await Leave.find({
      employee_id,
      status: 'Approved',
      $or: [
        { startDate: { $regex: `^${month}` } },
        { endDate: { $regex: `^${month}` } }
      ]
    });

    // Tag leaves on the map if no attendance recorded
    let approvedLeaveDays = 0;
    leaves.forEach(lv => {
      approvedLeaveDays += (lv.days || 1);
      // Mark dates between startDate and endDate
      const start = new Date(lv.startDate);
      const end = new Date(lv.endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dStr = getLocalDateString(d);
        if (dStr.startsWith(month) && !recordsMap[dStr]) {
          recordsMap[dStr] = {
            date: dStr,
            status: 'On Leave',
            notes: `${lv.leaveType}: ${lv.reason}`,
            workHoursFormatted: '0h 0m'
          };
        }
      }
    });

    return res.status(200).json({
      success: true,
      month,
      employee_id,
      summary: {
        presentDays,
        halfDays,
        leaveDays: approvedLeaveDays,
        totalWorkHours: Number(totalWorkHours.toFixed(1))
      },
      recordsMap,
      records
    });
  } catch (error) {
    console.error('Monthly Attendance Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin manual attendance mark or override
// @route   POST /api/attendance/manual
// @access  Private
const markManualAttendance = async (req, res) => {
  try {
    const { employee_id, employee_name, department, date, status, clockIn, clockOut, notes } = req.body;

    if (!employee_id || !date || !status) {
      return res.status(400).json({ success: false, message: 'Employee ID, date, and status are required.' });
    }

    let workHours = 0;
    let workHoursFormatted = '';
    let parsedClockIn = clockIn ? new Date(clockIn) : null;
    let parsedClockOut = clockOut ? new Date(clockOut) : null;

    if (parsedClockIn && parsedClockOut) {
      const diffMs = parsedClockOut.getTime() - parsedClockIn.getTime();
      const diffHours = Math.max(0, diffMs / (1000 * 60 * 60));
      workHours = Number(diffHours.toFixed(2));
      const h = Math.floor(diffHours);
      const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      workHoursFormatted = `${h}h ${m}m`;
    } else if (status === 'Present') {
      workHours = 8.0;
      workHoursFormatted = '8h 00m';
    } else if (status === 'Half Day') {
      workHours = 4.0;
      workHoursFormatted = '4h 00m';
    }

    const updated = await Attendance.findOneAndUpdate(
      { employee_id, date },
      {
        employee_id,
        employee_name: employee_name || 'Employee',
        department: department || '',
        date,
        status,
        clockIn: parsedClockIn,
        clockOut: parsedClockOut,
        workHours,
        workHoursFormatted,
        notes: notes || 'Admin marked'
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully.',
      attendance: updated
    });
  } catch (error) {
    console.error('Manual Attendance Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  clockIn,
  clockOut,
  getTodayStatus,
  getAttendanceLogs,
  getEmployeeMonthlyAttendance,
  markManualAttendance
};
