import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, Lock, Eye, EyeOff, UserPlus, CheckCircle2, AlertCircle, Shield, User, Hash } from 'lucide-react';
import { registerUser } from '../services/authService';
import securityIcon from '../assets/security-icon.svg';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    countryCode: '+91',
    password: '',
    confirmPassword: '',
    role: 'admin', // 'admin' | 'employee'
    employee_id: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [phoneInputInvalid, setPhoneInputInvalid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handlePhoneChange = (e) => {
    const inputValue = e.target.value;
    setFormData((current) => ({
      ...current,
      phone: e.target.value.replace(/\D/g, '').slice(0, 10)
    }));
    setPhoneInputInvalid(/[^\d]/.test(inputValue));
    if (error) setError('');
  };

  const handlePhoneKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
      return;
    }
    if (e.key.length === 1 && !/\d/.test(e.key)) {
      setPhoneInputInvalid(true);
      e.preventDefault();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Please enter a 10-digit phone number.');
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(formData.password)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify your password.');
      return;
    }

    if (formData.role === 'employee' && !formData.employee_id?.trim()) {
      setError('Please provide your Employee ID (e.g. EMP-101).');
      return;
    }

    try {
      setLoading(true);
      const data = await registerUser({
        ...formData,
        phone: `${formData.countryCode} ${formData.phone}`
      });
      setSuccess(data.message || 'Registration successful! Redirecting to dashboard...');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setFormData({
        email: '',
        phone: '',
        countryCode: '+91',
        password: '',
        confirmPassword: '',
        role: 'admin',
        employee_id: ''
      });

      navigate('/dashboard', { replace: true });

    } catch (err) {
      const serverMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand-logo">
            <img className="auth-security-icon" src={securityIcon} alt="Security" />
          </div>
          <div className="auth-badge">
            <UserPlus size={13} />
            <span>{formData.role === 'admin' ? 'Admin Portal' : 'Employee Portal'}</span>
          </div>
          <h1>{formData.role === 'admin' ? 'Create Admin Account' : 'Create Employee Account'}</h1>
          <p>
            {formData.role === 'admin'
              ? 'Sign up to manage company employees, payroll, and approvals'
              : 'Sign up to access your personal punch clock, attendance, and leaves'}
          </p>
        </div>

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

        <form onSubmit={handleSubmit} autoComplete="off">
          {/* Account Role Selector */}
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
              Select Account Role
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: 'admin' }))}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: formData.role === 'admin' ? '2px solid #111111' : '1px solid var(--border-color)',
                  background: formData.role === 'admin' ? '#111111' : '#ffffff',
                  color: formData.role === 'admin' ? '#ffffff' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Shield size={16} />
                <span>Admin / HR</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: 'employee' }))}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: formData.role === 'employee' ? '2px solid #111111' : '1px solid var(--border-color)',
                  background: formData.role === 'employee' ? '#111111' : '#ffffff',
                  color: formData.role === 'employee' ? '#ffffff' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <User size={16} />
                <span>Employee</span>
              </button>
            </div>
          </div>

          {/* Employee ID (Only for Employee accounts) */}
          {formData.role === 'employee' && (
            <div className="form-group">
              <label htmlFor="employee_id">Employee ID *</label>
              <div className="input-wrapper">
                <Hash className="input-icon" size={18} />
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
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Links your login to your employee profile, attendance, and leave calendar.
              </span>
            </div>
          )}

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon email-input-icon" size={18} />
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <div className="input-wrapper phone-input-wrapper">
              <Phone className="input-icon phone-input-icon" size={18} />
              <select
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                className="country-code-select"
                aria-label="Country code"
              >
                <option value="+91">+91</option>
                <option value="+1">+1</option>
                <option value="+44">+44</option>
                <option value="+61">+61</option>
                <option value="+971">+971</option>
              </select>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                onKeyDown={handlePhoneKeyDown}
                className={`form-input ${phoneInputInvalid ? 'phone-input-invalid' : ''}`}
                autoComplete="off"
                inputMode="numeric"
                maxLength={10}
                pattern="[0-9]{10}"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Create Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon password-input-icon" size={18} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-btn"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon password-input-icon" size={18} />
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Register Account</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
