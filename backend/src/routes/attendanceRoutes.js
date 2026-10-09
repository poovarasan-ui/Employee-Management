const express = require('express');
const router = express.Router();
const {
  clockIn,
  clockOut,
  getTodayStatus,
  getAttendanceLogs,
  getEmployeeMonthlyAttendance,
  markManualAttendance
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All attendance routes are protected
router.use(protect);

router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.get('/today/:employee_id', getTodayStatus);
router.get('/monthly/:employee_id', getEmployeeMonthlyAttendance);
router.get('/', getAttendanceLogs);
router.post('/manual', authorize('admin', 'hr'), markManualAttendance);

module.exports = router;
