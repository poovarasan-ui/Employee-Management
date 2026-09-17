import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Building2, UserCheck, Code2, ArrowUpRight,
  Plus, Search, Eye, AlertCircle, RefreshCw
} from 'lucide-react';
import { getDashboardStats } from '../services/employeeService';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    totalManagers: 0,
    totalDevelopers: 0,
    departmentStats: [],
    recentEmployees: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getDashboardStats();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([
      fetchStats(),
      new Promise((resolve) => setTimeout(resolve, 1000))
    ]);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: 'indigo',
      description: 'Active personnel in organization'
    },
    {
      title: 'Total Departments',
      value: stats.totalDepartments,
      icon: Building2,
      color: 'cyan',
      description: 'Operational business units'
    },
    {
      title: 'Total Managers',
      value: stats.totalManagers,
      icon: UserCheck,
      color: 'amber',
      description: 'Team leads and managers'
    },
    {
      title: 'Total Developers',
      value: stats.totalDevelopers,
      icon: Code2,
      color: 'emerald',
      description: 'Engineers and tech talent'
    }
  ];

  return (
    <div className="dashboard-page">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h2>Welcome back, {user.email ? user.email.split('@')[0] : 'Administrator'} 👋</h2>
          <p>
            Here is what's happening with your workforce today. Monitor headcounts, departments, and personnel.
          </p>
        </div>
        <div className="welcome-actions">
          <button onClick={handleRefresh} className="btn-secondary btn-icon-only" title="Refresh metrics" disabled={loading}>
            <RefreshCw size={17} />
          </button>
          <button onClick={() => navigate('/employees/add')} className="btn-primary-compact">
            <Plus size={16} />
            <span>New Employee</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Statistics Grid */}
      <div className="stats-grid">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`stat-card stat-${card.color}`}
            >
              <div className="stat-header">
                <span className="stat-title">{card.title}</span>
                <div className={`stat-icon-badge badge-${card.color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="stat-number">
                {loading ? <span className="stat-loading-pulse">--</span> : card.value}
              </div>
              <div className="stat-footer">
                <span className="stat-desc">{card.description}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Department Breakdown & Recent Employees */}
      <div className="dashboard-grid">
        {/* Recent Employees Card */}
        <div className="content-card recent-employees-card">
          <div className="card-header">
            <div>
              <h3>Recent Hires & Employees</h3>
              <p className="card-subtext">Click any employee to view their full profile</p>
            </div>
            <button
              onClick={() => navigate('/employees')}
              className="btn-text-link"
            >
              <span>View All Directory</span>
              <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="table-responsive">
            <table className="custom-table compact">
              <thead>
                <tr>
                  <th>Employee (Click to View)</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Joined</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="table-loading-cell">Loading recent records...</td>
                  </tr>
                ) : stats.recentEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="table-empty-cell">
                      No employees added yet. Click "+ Add Employee" to create your first record!
                    </td>
                  </tr>
                ) : (
                  stats.recentEmployees.map((emp) => (
                    <tr key={emp._id}>
                      <td>
                        <div 
                          className="employee-name-cell clickable-name-cell"
                          onClick={() => navigate(`/employees/view/${emp._id}`)}
                          title="Click to view full employee profile"
                        >
                          <div className="table-avatar sm">
                            {emp.name ? emp.name.charAt(0).toUpperCase() : 'E'}
                          </div>
                          <div>
                            <div className="emp-name-text highlight-link">{emp.name}</div>
                            <div className="emp-subtext">{emp.employee_id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="department-badge">{emp.department}</span>
                      </td>
                      <td>{emp.designation}</td>
                      <td>{formatDate(emp.joining_date)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="action-btn view-btn"
                          onClick={() => navigate(`/employees/view/${emp._id}`)}
                          title="View Full Profile"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Department Overview */}
        <div className="content-card dept-overview-card">
          <div className="card-header">
            <div>
              <h3>Department Breakdown</h3>
              <p className="card-subtext">Distribution of staff across teams</p>
            </div>
          </div>

          <div className="dept-list">
            {loading ? (
              <div className="dept-loading">Loading department data...</div>
            ) : stats.departmentStats.length === 0 ? (
              <div className="dept-empty">No department data available.</div>
            ) : (
              stats.departmentStats.map((dept, index) => {
                const percentage = stats.totalEmployees > 0
                  ? Math.round((dept.count / stats.totalEmployees) * 100)
                  : 0;

                return (
                  <div key={index} className="dept-item">
                    <div className="dept-info">
                      <span className="dept-name">{dept._id}</span>
                      <span className="dept-count">
                        <strong>{dept.count}</strong> staff ({percentage}%)
                      </span>
                    </div>
                    <div className="dept-progress-bar">
                      <div
                        className="dept-progress-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
