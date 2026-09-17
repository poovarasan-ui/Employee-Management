const Employee = require('../models/Employee');
const salaryPattern = /^\d+(\.\d+)?$/;

// @desc    Get dashboard metrics & statistics
// @route   GET /api/employees/stats
// @access  Private (JWT Protected)
const getDashboardStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();

    // Get distinct departments count
    const departments = await Employee.distinct('department');
    const totalDepartments = departments.length;

    // Count Managers (case-insensitive search for 'manager' in designation or department)
    const totalManagers = await Employee.countDocuments({
      designation: { $regex: /manager/i }
    });

    // Count Developers/Engineers (case-insensitive search for 'developer' or 'engineer' or 'frontend' or 'backend')
    const totalDevelopers = await Employee.countDocuments({
      $or: [
        { designation: { $regex: /developer/i } },
        { designation: { $regex: /engineer/i } },
        { designation: { $regex: /programmer/i } }
      ]
    });

    // Get 5 most recently added employees
    const recentEmployees = await Employee.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Get department distribution
    const departmentStats = await Employee.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalEmployees,
        totalDepartments,
        totalManagers,
        totalDevelopers,
        departmentStats,
        recentEmployees
      }
    });
  } catch (error) {
    console.error('Stats Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate dashboard statistics. ' + error.message
    });
  }
};

// @desc    Get all employees with Search & Filter
// @route   GET /api/employees
// @access  Private (JWT Protected)
const getEmployees = async (req, res) => {
  try {
    const { search, department, designation, role } = req.query;
    let query = {};

    // 1. Search by Name, Email, or Employee ID
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { employee_id: searchRegex }
      ];
    }

    // 2. Filter by Department
    if (department && department.trim() && department !== 'All') {
      query.department = department.trim();
    }

    // 3. Filter by Designation
    if (designation && designation.trim() && designation !== 'All') {
      query.designation = designation.trim();
    }

    if (role === 'manager') {
      query.designation = { $regex: /manager/i };
    }

    if (role === 'developer') {
      query.designation = { $regex: /developer|engineer|programmer/i };
    }

    const employees = await Employee.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: employees.length,
      employees
    });
  } catch (error) {
    console.error('Get Employees Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve employees. ' + error.message
    });
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  Private (JWT Protected)
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.'
      });
    }

    return res.status(200).json({
      success: true,
      employee
    });
  } catch (error) {
    console.error('Get Employee By ID Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Invalid Employee ID format or server error.'
    });
  }
};

// @desc    Create a new employee
// @route   POST /api/employees
// @access  Private (JWT Protected)
const createEmployee = async (req, res) => {
  try {
    const {
      employee_id,
      name,
      email,
      phone,
      department,
      designation,
      salary,
      joining_date
    } = req.body;

    // 1. Check all required fields
    if (
      !employee_id ||
      !name ||
      !email ||
      !phone ||
      !department ||
      !designation ||
      salary === undefined ||
      salary === '' ||
      !joining_date
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required. Please fill in all details.'
      });
    }

    if (!salaryPattern.test(String(salary).trim())) {
      return res.status(400).json({
        success: false,
        message: 'Salary must contain numbers only, for example 900000.'
      });
    }

    // 2. Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid employee email address.'
      });
    }

    // 3. Check for duplicate Employee ID
    const normalizedEmpId = employee_id.trim().toUpperCase();
    const existingId = await Employee.findOne({ employee_id: normalizedEmpId });
    if (existingId) {
      return res.status(400).json({
        success: false,
        message: `Employee ID '${normalizedEmpId}' is already assigned to another employee.`
      });
    }

    // 4. Check for duplicate Email
    const normalizedEmail = email.trim().toLowerCase();
    const existingEmail = await Employee.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: `Employee with email '${normalizedEmail}' already exists.`
      });
    }

    // 5. Create employee record
    const newEmployee = await Employee.create({
      employee_id: normalizedEmpId,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      department: department.trim(),
      designation: designation.trim(),
      salary: String(salary).trim(),
      joining_date: new Date(joining_date),
      createdBy: req.user?._id
    });

    return res.status(201).json({
      success: true,
      message: 'Employee created successfully!',
      employee: newEmployee
    });
  } catch (error) {
    console.error('Create Employee Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to create employee. ' + error.message
    });
  }
};

// @desc    Update employee details
// @route   PUT /api/employees/:id
// @access  Private (JWT Protected)
const updateEmployee = async (req, res) => {
  try {
    const {
      employee_id,
      name,
      email,
      phone,
      department,
      designation,
      salary,
      joining_date
    } = req.body;

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.'
      });
    }

    // Check if new employee_id conflicts with another record
    if (employee_id && employee_id.trim().toUpperCase() !== employee.employee_id) {
      const conflictId = await Employee.findOne({
        employee_id: employee_id.trim().toUpperCase(),
        _id: { $ne: req.params.id }
      });
      if (conflictId) {
        return res.status(400).json({
          success: false,
          message: `Employee ID '${employee_id.trim().toUpperCase()}' is already taken by another employee.`
        });
      }
      employee.employee_id = employee_id.trim().toUpperCase();
    }

    // Check if new email conflicts with another record
    if (email && email.trim().toLowerCase() !== employee.email) {
      const conflictEmail = await Employee.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: req.params.id }
      });
      if (conflictEmail) {
        return res.status(400).json({
          success: false,
          message: `Email '${email.trim().toLowerCase()}' is already used by another employee.`
        });
      }
      employee.email = email.trim().toLowerCase();
    }

    if (name) employee.name = name.trim();
    if (phone) employee.phone = phone.trim();
    if (department) employee.department = department.trim();
    if (designation) employee.designation = designation.trim();
    if (salary !== undefined) {
      if (!salaryPattern.test(String(salary).trim())) {
        return res.status(400).json({
          success: false,
          message: 'Salary must contain numbers only, for example 900000.'
        });
      }
      employee.salary = String(salary).trim();
    }
    if (joining_date) employee.joining_date = new Date(joining_date);

    const updatedEmployee = await employee.save();

    return res.status(200).json({
      success: true,
      message: 'Employee details updated successfully!',
      employee: updatedEmployee
    });
  } catch (error) {
    console.error('Update Employee Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update employee. ' + error.message
    });
  }
};

// @desc    Delete an employee
// @route   DELETE /api/employees/:id
// @access  Private (JWT Protected)
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.'
      });
    }

    await Employee.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: `Employee '${employee.name}' (${employee.employee_id}) deleted successfully.`
    });
  } catch (error) {
    console.error('Delete Employee Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete employee. ' + error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
