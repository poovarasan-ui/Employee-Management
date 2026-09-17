import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Search, Building2, AlertTriangle, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { getEmployees, getCachedEmployees, deleteEmployee } from '../services/employeeService';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { logActivity } from '../services/activityService';

const DeleteEmployeePage = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState(() => getCachedEmployees()?.employees || []);
  const [loading, setLoading] = useState(() => !getCachedEmployees());
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

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

  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;
    try {
      setDeleteLoading(true);
      const res = await deleteEmployee(employeeToDelete._id);

      // Successfully deleted -> Log activity safely inside the handler function
      logActivity('DELETE', 'Employee Deleted', `${employeeToDelete.name} was removed from the employee list`);

      setNotification({
        type: 'success',
        message: res.message || 'Employee deleted successfully.'
      });
      fetchEmployees();
      setTimeout(() => setNotification({ type: '', message: '' }), 4000);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete employee.'
      });
    } finally {
      setDeleteLoading(false);
      setEmployeeToDelete(null);
    }
  };

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
      <div className="crud-header-banner delete-theme">
        <div className="crud-icon-badge delete">
          <Trash2 size={24} />
        </div>
        <div>
          <div className="crud-op-tag delete">DELETE OPERATION</div>
          <h2>Delete Employee Records</h2>
          <p>Safely search, review, and remove employee profiles from the system with confirmation protection.</p>
        </div>
      </div>

      {/* Notifications */}
      {notification.message && (
        <div className={`alert ${notification.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Table Card */}
      <div className="table-card">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search employee to delete by name, ID, or email..."
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
                <th>Designation</th>
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
                  <td colSpan="7" className="table-empty-cell">No employee records found.</td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id}>
                    <td><span className="emp-id-badge">{emp.employee_id}</span></td>
                    <td>
                      <div 
                        className="employee-name-cell clickable-name-cell"
                        onClick={() => navigate(`/employees/view/${emp._id}`)}
                        title="Click to view full details"
                      >
                        <div className="table-avatar sm">{emp.name?.charAt(0)}</div>
                        <span className="emp-name-text highlight-link">{emp.name}</span>
                      </div>
                    </td>
                    <td>{emp.email}</td>
                    <td><span className="department-badge">{emp.department}</span></td>
                    <td>{emp.designation}</td>
                    <td><span className="salary-text">{formatSalaryINR(emp.salary)}</span></td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => setEmployeeToDelete(emp)}
                        className="btn-delete-action"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {employeeToDelete && (
        <DeleteConfirmModal
          employee={employeeToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => setEmployeeToDelete(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default DeleteEmployeePage;