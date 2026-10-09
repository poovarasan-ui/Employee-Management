const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getLeaves,
  updateLeaveStatus,
  getLeaveStats
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All leave routes are protected
router.use(protect);

router.post('/apply', applyLeave);
router.get('/', getLeaves);
router.get('/stats', getLeaveStats);
router.put('/:id/status', authorize('admin', 'hr'), updateLeaveStatus);

module.exports = router;
