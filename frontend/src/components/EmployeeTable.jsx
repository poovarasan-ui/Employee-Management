import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, RotateCcw, Eye, UserX, Briefcase, Building2
} from 'lucide-react';

const EmployeeTable = ({
  employees = [],
  loading = false,
  searchTerm = '',
  setSearchTerm,
  departmentFilter = 'All',
  setDepartmentFilter,
  designationFilter = 'All',
  setDesignationFilter
}) => {
  const navigate = useNavigate();

  // Predefined lists for standard department and designation options
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

  const designationOptions = [
    'All',
    'Software Engineer',
    'Senior Developer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'Project Manager',
    'HR Manager',
    'Product Manager',
    'UI/UX Designer',
    'QA Engineer',
    'Engineering Manager',
    'Technical Lead',
    'Data Analyst',
    'Data Scientist',
    'Business Analyst',
    'Business Development Manager',
    'Accountant',
    'Financial Analyst',
    'Sales Executive',
    'Operations Manager',
    'Recruiter',
    'Support Specialist'
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('All');
    setDesignationFilter('All');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
    <div className="table-card">
      {/* Search & Filter Toolbar */}
      <div className="table-toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, or employee ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
              ×
            </button>
          )}
        </div>

        <div className="filter-group">
          {/* Department Filter */}
          <div className="filter-select-wrapper">
            <Building2 size={16} className="filter-icon" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Departments</option>
              {departmentOptions
                .filter((d) => d !== 'All')
                .map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
            </select>
          </div>

          {/* Designation Filter */}
          <div className="filter-select-wrapper">
            <Briefcase size={16} className="filter-icon" />
            <select
              value={designationFilter}
              onChange={(e) => setDesignationFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Designations</option>
              {designationOptions
                .filter((d) => d !== 'All')
                .map((desig) => (
                  <option key={desig} value={desig}>
                    {desig}
                  </option>
                ))}
            </select>
          </div>

          {/* Reset Filters */}
          {(searchTerm || departmentFilter !== 'All' || designationFilter !== 'All') && (
            <button onClick={handleResetFilters} className="btn-reset-filters" title="Reset all filters">
              <RotateCcw size={15} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee Name (Click to View)</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Annual Salary (Rs)</th>
              <th>Joining Date</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="table-loading-cell">
                  Loading employees data...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan="9" className="table-empty-cell">
                  <div className="empty-state">
                    <UserX size={44} className="empty-icon" />
                    <h4>No employees found</h4>
                    <p>Try adjusting your search terms or filters, or add a new employee to get started.</p>
                    <button
                      className="btn-quick-add"
                      onClick={() => navigate('/employees/add')}
                      style={{ marginTop: '12px' }}
                    >
                      + Add New Employee
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp._id} className="table-row">
                  <td>
                    <span 
                      className="emp-id-badge clickable-id"
                      onClick={() => navigate(`/employees/view/${emp._id}`)}
                      title="Click to view full employee profile"
                    >
                      {emp.employee_id}
                    </span>
                  </td>
                  <td>
                    <div 
                      className="employee-name-cell clickable-name-cell"
                      onClick={() => navigate(`/employees/view/${emp._id}`)}
                      title="Click to view full employee profile"
                    >
                      <div className="table-avatar">
                        {emp.name ? emp.name.charAt(0).toUpperCase() : 'E'}
                      </div>
                      <div>
                        <div className="emp-name-text highlight-link">{emp.name}</div>
                        <div className="emp-subtext click-hint">View full details →</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="emp-email-text">{emp.email}</span>
                  </td>
                  <td>{emp.phone}</td>
                  <td>
                    <span className="department-badge">{emp.department}</span>
                  </td>
                  <td>
                    <span className="designation-text">{emp.designation}</span>
                  </td>
                  <td>
                    <span className="salary-text">{formatSalaryINR(emp.salary)}</span>
                  </td>
                  <td>{formatDate(emp.joining_date)}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="action-btn view-btn"
                        onClick={() => navigate(`/employees/view/${emp._id}`)}
                        title="View Full Profile Details"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer / Summary */}
      {!loading && employees.length > 0 && (
        <div className="table-footer-info">
          <span>Showing <strong>{employees.length}</strong> employee records • Click any employee name to view their full details</span>
        </div>
      )}

    </div>
  );
};

export default EmployeeTable;
