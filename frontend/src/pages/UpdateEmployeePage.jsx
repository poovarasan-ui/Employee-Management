import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, Search, Building2, Briefcase, RefreshCw, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { getEmployees, getCachedEmployees } from '../services/employeeService';

const UpdateEmployeePage = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState(() => getCachedEmployees()?.employees || []);
  const [loading, setLoading] = useState(() => !getCachedEmployees());
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (departmentFilter !== 'All') params.department = departmentFilter;

      const data = await getEmployees(params);
      if (data.success) {
        setEmployees(data.employees);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [searchTerm, departmentFilter]);

  const departmentOptions = [
    'All',
    'Engineering',
    'Human Resources',
    'Marketing',
    'Finance',
    'Sales',
    'Product',
    'Operations',
    'Customer Support',
    'Administration',
    'Information Technology',
    'Legal',
    'Logistics',
    'Research and Development',
    'Quality Assurance',
    'Procurement',
    'Manufacturing',
    'Business Development'
  ];

  const formatSalaryINR = (val) => {
    const salaryRange = String(val ?? '').trim() || '0';
    return salaryRange
      .split('-')
      .map((amount) => new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(Number(amount.trim())))
      .join(' - ');
  };

  return (
    <div className="crud-page">
      {/* Header */}
      <div className="crud-header-banner update-theme">
        <div className="crud-icon-badge update">
          <Edit3 size={24} />
        </div>
        <div>
          <div className="crud-op-tag update">UPDATE OPERATION</div>
          <h2>Update Employee Details</h2>
          <p>Search and select any employee record to modify their personal details, salary, department, or designation.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="table-card">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search employee by name, ID, or email to edit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <div className="filter-select-wrapper">
              <Building2 size={16} className="filter-icon" />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="filter-select"
              >
                <option value="All">All Departments</option>
                {departmentOptions.filter((d) => d !== 'All').map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <button onClick={fetchEmployees} className="btn-secondary btn-icon-only" title="Refresh">
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Current Designation</th>
                <th>Annual Salary (Rs)</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="table-loading-cell">Loading employee records...</td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="table-empty-cell">No employee records match your search.</td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id}>
                    <td><span className="emp-id-badge">{emp.employee_id}</span></td>
                    <td>
                      <div className="employee-name-cell">
                        <div className="table-avatar sm">{emp.name?.charAt(0)}</div>
                        <span className="emp-name-text">{emp.name}</span>
                      </div>
                    </td>
                    <td>{emp.email}</td>
                    <td><span className="department-badge">{emp.department}</span></td>
                    <td>{emp.designation}</td>
                    <td><span className="salary-text">{formatSalaryINR(emp.salary)}</span></td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => navigate(`/employees/edit/${emp._id}`)}
                        className="btn-update-action"
                      >
                        <Edit3 size={14} />
                        <span>Update</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UpdateEmployeePage;
