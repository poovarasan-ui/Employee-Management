import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  UserPlus, ArrowLeft, Mail, Phone, Building2, 
  Briefcase, IndianRupee, Calendar, Hash, CheckCircle2, AlertCircle
} from 'lucide-react';
import { createEmployee } from '../services/employeeService';
import { logActivity } from '../services/activityService';

const AddEmployee = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    salary: '',
    joining_date: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const departments = [
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

  const designations = [
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (
      !formData.employee_id ||
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.department ||
      !formData.designation ||
      formData.salary === '' ||
      !formData.joining_date
    ) {
      setError('Please complete all fields before submitting.');
      return;
    }

    if (!/^\d+(\.\d+)?$/.test(formData.salary.trim())) {
      setError('Salary must contain numbers only, for example 900000.');
      return;
    }

    try {
      setLoading(true);
      const res = await createEmployee(formData);

      logActivity('CREATE', 'Employee Created', `${formData.name} was added to the employee directory`);

      setSuccess(res.message || 'Employee added successfully! Redirecting...');

      setTimeout(() => {
        navigate('/employees');
      }, 1000);

    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create employee. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page-container">
      <div className="form-card">
        {/* Header */}
        <div className="form-card-header">
          <Link to="/employees" className="back-link">
            <ArrowLeft size={16} />
            <span>Back to Employee List</span>
          </Link>

          <div className="form-title-wrap">
            <div className="form-icon-badge">
              <UserPlus size={22} />
            </div>
            <div>
              <h2>Add New Employee (CREATE)</h2>
              <p>Enter the personal, role, and compensation details for the new staff member</p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="employee-form">
          <div className="form-grid">
            {/* Employee ID */}
            <div className="form-group">
              <label htmlFor="employee_id">Employee ID *</label>
              <div className="input-wrapper">
                <Hash className="input-icon" size={17} />
                <input
                  id="employee_id"
                  type="text"
                  name="employee_id"
                  placeholder="e.g. EMP-101"
                  value={formData.employee_id}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <div className="input-wrapper">
                <UserPlus className="input-icon" size={17} />
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={17} />
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="e.g. rahul.sharma@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <div className="input-wrapper">
                <Phone className="input-icon" size={17} />
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Department */}
            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <div className="input-wrapper">
                <Building2 className="input-icon" size={17} />
                <input
                  id="department"
                  type="text"
                  name="department"
                  placeholder="e.g. Engineering"
                  value={formData.department}
                  onChange={handleChange}
                  list="department-suggestions"
                  className="form-input"
                  required
                />
                <datalist id="department-suggestions">
                  {departments.map((dept) => (
                    <option key={dept} value={dept} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Designation */}
            <div className="form-group">
              <label htmlFor="designation">Designation *</label>
              <div className="input-wrapper">
                <Briefcase className="input-icon" size={17} />
                <input
                  id="designation"
                  type="text"
                  name="designation"
                  placeholder="e.g. Senior Software Engineer"
                  value={formData.designation}
                  onChange={handleChange}
                  list="designation-suggestions"
                  className="form-input"
                  required
                />
                <datalist id="designation-suggestions">
                  {designations.map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Annual salary in rupees */}
            <div className="form-group">
              <label htmlFor="salary">Annual Salary (Rs) *</label>
              <div className="input-wrapper">
                <IndianRupee className="input-icon" size={17} />
                <input
                  id="salary"
                  type="number"
                  name="salary"
                  placeholder="e.g. 900000"
                  min="0"
                  step="0.01"
                  value={formData.salary}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Joining Date */}
            <div className="form-group">
              <label htmlFor="joining_date">Joining Date *</label>
              <div className="input-wrapper">
                <Calendar className="input-icon" size={17} />
                <input
                  id="joining_date"
                  type="date"
                  name="joining_date"
                  value={formData.joining_date}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions-bar">
            <button
              type="button"
              onClick={() => navigate('/employees')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary-compact"
              disabled={loading}
              style={{ minWidth: '150px' }}
            >
              {loading ? (
                <>
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>Save Employee</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
