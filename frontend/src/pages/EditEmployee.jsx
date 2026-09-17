import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Edit3, ArrowLeft, Mail, Phone, Building2, 
  Briefcase, IndianRupee, Calendar, Hash, CheckCircle2, AlertCircle
} from 'lucide-react';
import { getEmployeeById, updateEmployee } from '../services/employeeService';
import { logActivity } from '../services/activityService';

const EditEmployee = () => {
  const { id } = useParams();
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

  const [fetchLoading, setFetchLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
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

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setFetchLoading(true);
        const data = await getEmployeeById(id);
        if (data.success && data.employee) {
          const emp = data.employee;
          let formattedDate = '';
          if (emp.joining_date) {
            formattedDate = new Date(emp.joining_date).toISOString().split('T')[0];
          }

          setFormData({
            employee_id: emp.employee_id || '',
            name: emp.name || '',
            email: emp.email || '',
            phone: emp.phone || '',
            department: emp.department || '',
            designation: emp.designation || '',
            salary: emp.salary !== undefined ? emp.salary : '',
            joining_date: formattedDate
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load employee details.');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

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
      setError('Please fill in all fields.');
      return;
    }

    if (!/^\d+(\.\d+)?$/.test(String(formData.salary).trim())) {
      setError('Salary must contain numbers only, for example 900000.');
      return;
    }

    try {
      setSaveLoading(true);
      const res = await updateEmployee(id, formData);

      // Successfully updated -> Log activity here using formData.name
      logActivity('UPDATE', 'Employee Updated', `${formData.name}'s details were updated`);

      setSuccess(res.message || 'Employee updated successfully!');

    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update employee. Please try again.';
      setError(msg);
    } finally {
      setSaveLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="form-page-container">
        <div className="form-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading employee profile...</p>
        </div>
      </div>
    );
  }

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
              <Edit3 size={22} />
            </div>
            <div>
              <h2>Edit Employee Profile (UPDATE)</h2>
              <p>Update personnel details, compensation, and department information</p>
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
                  value={formData.employee_id}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Name */}
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <div className="input-wrapper">
                <Edit3 className="input-icon" size={17} />
                <input
                  id="name"
                  type="text"
                  name="name"
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
              disabled={saveLoading}
              style={{ minWidth: '150px' }}
            >
              {saveLoading ? (
                <>
                  <span>Updating Database...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Update Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployee;