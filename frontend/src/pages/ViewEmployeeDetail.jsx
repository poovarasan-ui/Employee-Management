import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, Building2, Briefcase, 
  IndianRupee, Calendar, Hash, Clock,
  CheckCircle2, User
} from 'lucide-react';
import { getEmployeeById } from '../services/employeeService';

const ViewEmployeeDetail = () => {
  const { id } = useParams();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const data = await getEmployeeById(id);
        if (data.success && data.employee) {
          setEmployee(data.employee);
        } else {
          setError('Employee details could not be retrieved.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Employee not found or server error.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  if (loading) {
    return (
      <div className="form-page-container">
        <div className="form-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: 'var(--text-muted)' }}>Retrieving employee details from database...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="form-page-container">
        <div className="form-card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <h3 style={{ color: '#fb7185', marginBottom: '10px' }}>Employee Not Found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>{error || 'The requested employee profile does not exist.'}</p>
          <Link to="/employees" className="btn-primary-compact">
            <ArrowLeft size={16} />
            <span>Back to Employee Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-detail-page">
      {/* Top Navigation */}
      <div className="detail-top-nav">
        <Link to="/employees" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to Read Employees Directory</span>
        </Link>
      </div>

      {/* Main Profile Hero Card */}
      <div className="profile-hero-card">
        <div className="profile-hero-left">
          <div className="profile-avatar-large">
            {employee.name ? employee.name.charAt(0).toUpperCase() : 'E'}
          </div>
          <div className="profile-hero-info">
            <div className="profile-id-pill">
              <Hash size={13} />
              <span>{employee.employee_id}</span>
            </div>
            <h2>{employee.name}</h2>
            <div className="profile-tags">
              <span className="department-badge">{employee.department}</span>
              <span className="profile-designation-badge">{employee.designation}</span>
            </div>
          </div>
        </div>

        <div className="profile-hero-right">
          <div className="salary-box">
            <span className="salary-box-label">ANNUAL SALARY (Rs)</span>
            <span className="salary-box-value">{formatSalaryINR(employee.salary)}</span>
          </div>
        </div>
      </div>

      {/* Detailed Specifications Grid */}
      <div className="profile-grid">
        {/* Contact Information Card */}
        <div className="profile-section-card">
          <div className="section-card-header">
            <Mail size={18} className="section-icon" />
            <h3>Contact Information</h3>
          </div>
          <div className="info-rows">
            <div className="info-row">
              <span className="info-label">Email Address</span>
              <a href={`mailto:${employee.email}`} className="info-value link-value">
                {employee.email}
              </a>
            </div>
            <div className="info-row">
              <span className="info-label">Phone Number</span>
              <a href={`tel:${employee.phone}`} className="info-value link-value">
                {employee.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Organizational Details Card */}
        <div className="profile-section-card">
          <div className="section-card-header">
            <Building2 size={18} className="section-icon" />
            <h3>Organizational Details</h3>
          </div>
          <div className="info-rows">
            <div className="info-row">
              <span className="info-label">Department</span>
              <span className="info-value">{employee.department}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Job Title / Designation</span>
              <span className="info-value">{employee.designation}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Joining Date</span>
              <span className="info-value">{formatDate(employee.joining_date)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
    </div>
  );
};

export default ViewEmployeeDetail;
