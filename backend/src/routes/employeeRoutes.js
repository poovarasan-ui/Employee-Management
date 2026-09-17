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
const { protect } = require('../middleware/authMiddleware');

// All employee routes are protected by JWT authentication
router.use(protect);

// GET /api/employees/stats - Dashboard Metrics
router.get('/stats', getDashboardStats);

// GET /api/employees - Get all employees with search & filters
// POST /api/employees - Create a new employee
router.route('/')
  .get(getEmployees)
  .post(createEmployee);

// GET /api/employees/:id - Get single employee
// PUT /api/employees/:id - Update employee
// DELETE /api/employees/:id - Delete employee
router.route('/:id')
  .get(getEmployeeById)
  .put(updateEmployee)
  .delete(deleteEmployee);

module.exports = router;
