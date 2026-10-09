const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');

// @desc    Apply for leave
// @route   POST /api/leaves/apply
// @access  Private
const applyLeave = async (req, res) => {
  try {
    const { employee_id, employee_name, department, leaveType, startDate, endDate, reason } = req.body;

    if (!employee_id || !leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide employee, leave type, start date, end date, and reason.'
      });
    }

    // Calculate days between start and end date inclusive
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date.'
      });
    }

    const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const leave = new Leave({
      employee_id,
      employee_name: employee_name || 'Employee',
      department: department || '',
      leaveType,
      startDate,
      endDate,
      days: diffDays > 0 ? diffDays : 1,
      reason,
      status: 'Pending'
    });

    await leave.save();

    return res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully. Awaiting HR approval.',
      leave
    });
  } catch (error) {
    console.error('Apply Leave Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to submit leave request.' });
  }
};

// @desc    Get all leave requests with optional filters
// @route   GET /api/leaves
// @access  Private
const getLeaves = async (req, res) => {
  try {
    const { status, employee_id } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (employee_id) {
      filter.employee_id = employee_id;
    }

    const leaves = await Leave.find(filter).sort({ appliedAt: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: leaves.length,
      leaves
    });
  } catch (error) {
    console.error('Get Leaves Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or Reject leave request
// @route   PUT /api/leaves/:id/status
// @access  Private
const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Status must be Approved or Rejected.'
      });
    }

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    leave.status = status;
    leave.adminComment = adminComment || '';
    leave.reviewedBy = req.user?.username || req.user?.email || 'Admin';
    leave.reviewedAt = new Date();

    await leave.save();

    // If Approved, also record in attendance as 'On Leave' for those calendar dates
    if (status === 'Approved') {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        // Upsert attendance for that date as 'On Leave'
        await Attendance.findOneAndUpdate(
          { employee_id: leave.employee_id, date: dateStr },
          {
            employee_id: leave.employee_id,
            employee_name: leave.employee_name,
            department: leave.department,
            date: dateStr,
            status: 'On Leave',
            workHours: 0,
            workHoursFormatted: '0h 0m',
            notes: `Leave Approved: ${leave.leaveType}`
          },
          { upsert: true }
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: `Leave application marked as ${status}.`,
      leave
    });
  } catch (error) {
    console.error('Update Leave Status Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get leave statistics
// @route   GET /api/leaves/stats
// @access  Private
const getLeaveStats = async (req, res) => {
  try {
    const total = await Leave.countDocuments();
    const pending = await Leave.countDocuments({ status: 'Pending' });
    const approved = await Leave.countDocuments({ status: 'Approved' });
    const rejected = await Leave.countDocuments({ status: 'Rejected' });

    return res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        approved,
        rejected
      }
    });
  } catch (error) {
    console.error('Leave Stats Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  applyLeave,
  getLeaves,
  updateLeaveStatus,
  getLeaveStats
};
