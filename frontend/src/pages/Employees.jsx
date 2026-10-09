import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Users, RefreshCw, AlertCircle, CheckCircle2, CloudSnow } from 'lucide-react';
import { getEmployees, getCachedEmployees } from '../services/employeeService';
import EmployeeTable from '../components/EmployeeTable';

const Employees = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleFilter = searchParams.get('role') || '';

  const [employees, setEmployees] = useState(() => getCachedEmployees()?.employees || []);
  const [totalCount, setTotalCount] = useState(() => getCachedEmployees()?.employees?.length || 0);
  const [loading, setLoading] = useState(() => !getCachedEmployees());
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [designationFilter, setDesignationFilter] = useState('All');

  const [notification, setNotification] = useState({ type: '', message: '' });

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (departmentFilter !== 'All') params.department = departmentFilter;
      if (designationFilter !== 'All') params.designation = designationFilter;
      if (roleFilter) params.role = roleFilter;

      const data = await getEmployees(params);
      if (data.success) {
        setEmployees(data.employees);
        // Only update total count when no filters are active
        if (!params.search && !params.department && !params.designation && !params.role) {
          setTotalCount(data.count);
        }
      }
    } catch (err) {
      setNotification({
        type: 'error',
       
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [searchTerm, departmentFilter, designationFilter, roleFilter]);

  return (
    <div className="employees-page">
      <div className="page-header-banner">
        <div>
          <h2>Employee Directory</h2>
          <p>Manage, search, filter, and maintain organizational personnel records
            {totalCount > 0 && (
              <span style={{ marginLeft: '10px', background: '#111111', color: '#ffffff', fontSize: '11.5px', fontWeight: '700', padding: '2px 10px', borderRadius: '999px', letterSpacing: '0.04em' }}>
                {totalCount} Total
              </span>
            )}
          </p>
        </div>
        <div className="page-header-actions">
          <button
            onClick={fetchEmployeeData}
            className="btn-secondary"
            title="Reload table"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate('/employees/add')}
            className="btn-primary-compact"
          >
            <Plus size={16} />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {notification.message && (
        <div className={`alert ${notification.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      <EmployeeTable
        employees={employees}
        totalCount={totalCount}
        loading={loading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        designationFilter={designationFilter}
        setDesignationFilter={setDesignationFilter}
      />
    </div>
  );
};

export default Employees;