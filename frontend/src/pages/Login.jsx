import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, Lock, Eye, EyeOff, LogIn, CheckCircle2, AlertCircle } from 'lucide-react';
import { loginUser } from '../services/authService';
import securityIcon from '../assets/security-icon.svg';

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    countryCode: '+91',
    password: ''
  });

  const [loginMethod, setLoginMethod] = useState('phone');
  const [phoneInputInvalid, setPhoneInputInvalid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

    if (!(loginMethod === 'email' ? formData.email : formData.phone) || !formData.password) {
      setError('Please enter your login details and password.');
      return;
    }

    if (loginMethod === 'phone' && !/^\d{10}$/.test(formData.phone)) {
      setError('Please enter a 10-digit phone number.');
      return;
    }

    try {
      setLoading(true);
      const data = await loginUser(loginMethod === 'email'
        ? { email: formData.email, password: formData.password }
        : {
            phone: `${formData.countryCode} ${formData.phone}`,
            password: formData.password
          });

      setSuccess('Login successful! Redirecting to dashboard...');

      // Store JWT token and user profile in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setTimeout(() => {
        navigate('/dashboard');
      }, 700);

    } catch (err) {
      const serverMessage = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-brand-logo">
            <img className="auth-security-icon" src={securityIcon} alt="Security" />
          </div>
          <div className="auth-badge">
            <LogIn size={13} />
            <span>Enterprise Portal</span>
          </div>
          <h1>Employee Management</h1>
          <p>Sign in to manage employees, departments, and payroll metrics</p>
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
          <div className="login-method-switch" role="group" aria-label="Login method">
            <button
              type="button"
              className={loginMethod === 'email' ? 'active' : ''}
              onClick={() => setLoginMethod('email')}
            >
              Email
            </button>
            <button
              type="button"
              className={loginMethod === 'phone' ? 'active' : ''}
              onClick={() => setLoginMethod('phone')}
            >
              Phone
            </button>
          </div>

          {/* Email or Phone Field */}
          <div className="form-group">
            <label htmlFor={loginMethod === 'email' ? 'email' : 'phone'}>
              {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
            </label>
            <div className={`input-wrapper ${loginMethod === 'phone' ? 'phone-input-wrapper' : ''}`}>
              {loginMethod === 'email' ? <Mail className="input-icon email-input-icon" size={18} /> : <Phone className="input-icon phone-input-icon" size={18} />}
              {loginMethod === 'phone' && (
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
              )}
              <input
                id={loginMethod === 'email' ? 'email' : 'phone'}
                type={loginMethod === 'email' ? 'email' : 'tel'}
                name={loginMethod === 'email' ? 'email' : 'phone'}
                value={loginMethod === 'email' ? formData.email : formData.phone}
                onChange={loginMethod === 'email' ? handleChange : handlePhoneChange}
                onKeyDown={loginMethod === 'phone' ? handlePhoneKeyDown : undefined}
                className={`form-input ${loginMethod === 'phone' && phoneInputInvalid ? 'phone-input-invalid' : ''}`}
                autoComplete={loginMethod === 'email' ? 'new-password' : 'off'}
                {...(loginMethod === 'phone' ? {
                  inputMode: 'numeric',
                  maxLength: 10,
                  pattern: '[0-9]{10}'
                } : {})}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
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

          {/* Submit Button */}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In to Dashboard</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account yet? <Link to="/register">Create new account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
