const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All employee routes are protected by JWT authentication
router.use(protect);

// GET /api/employees/stats - Dashboard Metrics
router.get('/stats', getDashboardStats);

// GET /api/employees - Get all employees with search & filters
// POST /api/employees - Create a new employee (Admin/HR only)
router.route('/')
  .get(getEmployees)
  .post(authorize('admin', 'hr'), createEmployee);

// GET /api/employees/:id - Get single employee
// PUT /api/employees/:id - Update employee (Admin/HR only)
// DELETE /api/employees/:id - Delete employee (Admin/HR only)
router.route('/:id')
  .get(getEmployeeById)
  .put(authorize('admin', 'hr'), updateEmployee)
  .delete(authorize('admin', 'hr'), deleteEmployee);

module.exports = router;
