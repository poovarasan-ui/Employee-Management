import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEmployees } from '../services/employeeService';
import { getCurrentUser, isEmployee } from '../utils/auth';
import MonthlyAttendanceCalendar from '../components/MonthlyAttendanceCalendar';
import { clockIn, clockOut, getTodayStatus } from '../services/attendanceService';
import { getLeaves } from '../services/leaveService';
import { Clock, Calendar, CheckCircle, AlertTriangle, FileText, User, ArrowRight, Play, Square, Building2, Briefcase } from 'lucide-react';

// --- FALLBACK DATA ---
const FALLBACK_EMPLOYEES = [
  { employee_id: 'EMP-101', name: 'Poovaran Sambath', email: 'poovarasansambath135@gmail.com', department: 'Operations', designation: 'Product Manager', salary: 20.0, status: 'Active' },
  { employee_id: 'EMP-102', name: 'Alex Rivera', email: 'alex.rivera@enterprise.com', department: 'Engineering', designation: 'Full Stack Developer', salary: 14.5, status: 'Active' },
  { employee_id: 'EMP-103', name: 'Elena Rostov', email: 'elena.rostov@enterprise.com', department: 'Human Resources', designation: 'HR Manager', salary: 12.0, status: 'Active' },
  { employee_id: 'EMP-104', name: 'Sarah Connor', email: 'sarah.connor@enterprise.com', department: 'Engineering', designation: 'Senior Developer', salary: 16.0, status: 'On Leave' },
  { employee_id: 'EMP-105', name: 'David Kim', email: 'david.kim@enterprise.com', department: 'Engineering', designation: 'Backend Developer', salary: 9.8, status: 'Active' },
  { employee_id: 'EMP-106', name: 'Jessica Taylor', email: 'jessica.taylor@enterprise.com', department: 'Finance', designation: 'Financial Analyst', salary: 13.5, status: 'Active' },
  { employee_id: 'EMP-107', name: 'Marcus Vance', email: 'marcus.vance@enterprise.com', department: 'Engineering', designation: 'DevOps Engineer', salary: 18.0, status: 'Active' }
];

export default function Dashboard() {
  const [employees, setEmployees] = useState(FALLBACK_EMPLOYEES);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('This Week');
  const [alertMessage, setAlertMessage] = useState('');

  // --- NEW STATES FOR "SEE MORE" TOGGLES ---
  const [showAllEmployees, setShowAllEmployees] = useState(false);
  const [showWorkloadModal, setShowWorkloadModal] = useState(false);

  // Fetch data safely with fallback handling
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await getEmployees();
        if (data.success && Array.isArray(data.employees) && data.employees.length > 0) {
          setEmployees(data.employees);
        }
      } catch (err) {
        console.warn('Failed to fetch employees. Using local records.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // ── Time-range filter helper (uses createdAt — when the record was added to DB) ──
  const getTimeFilteredEmployees = (list, range) => {
    const now = new Date();
    const startOfToday     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfToday.getDate() - 1);
    const startOfWeek  = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay()); // Sunday
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const filtered = list.filter(e => {
      // Use createdAt (when DB record was created), fallback to joining_date
      const recordDate = e.createdAt || e.joining_date;
      if (!recordDate) return true;
      const date = new Date(recordDate);
      if (range === 'Today')      return date >= startOfToday;
      if (range === 'Yesterday')  return date >= startOfYesterday && date < startOfToday;
      if (range === 'This Week')  return date >= startOfWeek;
      if (range === 'This Month') return date >= startOfMonth;
      return true;
    });

    // If no records found for this period, fall back to all employees
    return filtered.length > 0 ? filtered : null;
  };

  // Employees filtered by time range (used for metric cards)
  const rawFiltered = getTimeFilteredEmployees(employees, timeRange);
  const timeFilteredEmployees = rawFiltered ?? employees;
  const isUsingFallback = rawFiltered === null;

  // Employees filtered by search bar (shown in analytics feed)
  const filteredEmployees = employees.filter(e =>
    (e.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.designation || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Limit visible items unless "See More" is clicked
  const displayedEmployees = showAllEmployees ? filteredEmployees : filteredEmployees.slice(0, 4);

  // Metric values now react to timeRange
  const totalEmployees = timeFilteredEmployees.length;
  const activeCount = timeFilteredEmployees.filter(e => (e.status || 'Active') === 'Active').length;
  const activePercentage = totalEmployees === 0 ? 0 : Math.round((activeCount / totalEmployees) * 100);
  const uniqueDepts = [...new Set(timeFilteredEmployees.map(e => e.department))].length;

  // CSV Report Download Handler
  const handleDownloadReport = () => {
    try {
      const csvHeader = "Employee ID,Name,Email,Department,Designation,Salary (LPA),Status\n";
      const csvRows = employees.map(e => 
        `"${e.employee_id || 'EMP'}","${e.name || ''}","${e.email || ''}","${e.department || ''}","${e.designation || ''}",${e.salary || 0},"${e.status || 'Active'}"`
      ).join("\n");
      
      const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Employee_Analytics_Report.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setAlertMessage('✅ Employee Report downloaded successfully!');
      setTimeout(() => setAlertMessage(''), 4000);
    } catch (e) {
      setAlertMessage('❌ Failed to download report.');
    }
  };

  const currentUser = getCurrentUser();
  const userIsEmp = isEmployee();

  // Employee-specific state
  const [empTodayStatus, setEmpTodayStatus] = useState(null);
  const [empElapsed, setEmpElapsed] = useState(0);
  const [empClockLoading, setEmpClockLoading] = useState(false);
  const [myLeaves, setMyLeaves] = useState([]);

  const myEmp = employees.find(e => 
    (currentUser?.employee_id && e.employee_id === currentUser.employee_id) ||
    (currentUser?.email && e.email?.toLowerCase() === currentUser.email?.toLowerCase())
  ) || {
    employee_id: currentUser?.employee_id || 'EMP-101',
    name: currentUser?.username || 'Employee',
    department: 'Engineering',
    designation: 'Team Member'
  };

  useEffect(() => {
    if (userIsEmp && myEmp?.employee_id) {
      getTodayStatus(myEmp.employee_id).then(res => {
        if (res.success) {
          setEmpTodayStatus(res);
          if (res.isClockedIn && res.attendance?.clockIn) {
            const diffSec = Math.floor((Date.now() - new Date(res.attendance.clockIn).getTime()) / 1000);
            setEmpElapsed(Math.max(0, diffSec));
          }
        }
      }).catch(err => console.warn(err));

      getLeaves({ employee_id: myEmp.employee_id }).then(res => {
        if (res.success) setMyLeaves(res.leaves || []);
      }).catch(err => console.warn(err));
    }
  }, [userIsEmp, myEmp?.employee_id]);

  useEffect(() => {
    let timer = null;
    if (userIsEmp && empTodayStatus?.isClockedIn) {
      timer = setInterval(() => setEmpElapsed(s => s + 1), 1000);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [userIsEmp, empTodayStatus?.isClockedIn]);

  const handleEmpClockIn = async () => {
    try {
      setEmpClockLoading(true);
      const res = await clockIn({
        employee_id: myEmp.employee_id,
        employee_name: myEmp.name,
        department: myEmp.department
      });
      if (res.success) {
        setAlertMessage('✅ Clocked in successfully!');
        const updated = await getTodayStatus(myEmp.employee_id);
        setEmpTodayStatus(updated);
      }
    } catch (err) {
      setAlertMessage('❌ ' + (err.response?.data?.message || 'Failed to clock in'));
    } finally {
      setEmpClockLoading(false);
    }
  };

  const handleEmpClockOut = async () => {
    try {
      setEmpClockLoading(true);
      const res = await clockOut({ employee_id: myEmp.employee_id });
      if (res.success) {
        setAlertMessage('✅ Clocked out successfully!');
        const updated = await getTodayStatus(myEmp.employee_id);
        setEmpTodayStatus(updated);
      }
    } catch (err) {
      setAlertMessage('❌ ' + (err.response?.data?.message || 'Failed to clock out'));
    } finally {
      setEmpClockLoading(false);
    }
  };

  const formatSeconds = (sec) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, '0');
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${h}h ${m}m ${s}s`;
  };

  // ── Render Employee Self-Service Dashboard if user is Employee ──
  if (userIsEmp) {
    return (
      <div style={{ backgroundColor: '#f4f6f8', minHeight: '100vh', padding: '28px 36px', fontFamily: 'var(--font-main)', width: '100%', boxSizing: 'border-box' }}>
        {/* Toast Alert */}
        {alertMessage && (
          <div style={{ background: '#fef9e7', color: '#7a5c00', padding: '12px 20px', borderRadius: '12px', marginBottom: '20px', fontWeight: '600', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{alertMessage}</span>
            <button onClick={() => setAlertMessage('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
          </div>
        )}

        {/* Employee Hero Header */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px 28px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(6, 182, 212, 0.12)', color: '#0e7490', fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', marginBottom: '8px' }}>
              <User size={13} />
              <span>EMPLOYEE SELF-SERVICE PORTAL</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px 0', color: '#111827' }}>
              Welcome back, {myEmp.name}!
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
              ID: <strong>{myEmp.employee_id}</strong> • {myEmp.designation} • {myEmp.department}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/attendance" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#111111', color: '#ffffff', borderRadius: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
              <Clock size={16} />
              <span>Full Punch Station & Leaves</span>
            </Link>
          </div>
        </div>

        {/* 3 Overview Quick Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          {/* Punch Clock Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Today's Shift</span>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: empTodayStatus?.isClockedIn ? '#dcfce7' : (empTodayStatus?.isClockedOut ? '#f0fdf4' : '#fffbeb'), color: empTodayStatus?.isClockedIn ? '#15803d' : (empTodayStatus?.isClockedOut ? '#166534' : '#b45309') }}>
                {empTodayStatus?.isClockedIn ? 'CLOCKED IN' : (empTodayStatus?.isClockedOut ? 'SHIFT COMPLETED' : 'NOT CLOCKED IN')}
              </span>
            </div>

            <div style={{ textAlign: 'center', padding: '10px 0 16px 0' }}>
              {empTodayStatus?.isClockedIn ? (
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 800, color: '#065f46' }}>
                    {formatSeconds(empElapsed)}
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Working now</span>
                </div>
              ) : empTodayStatus?.isClockedOut ? (
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#166534' }}>
                    {empTodayStatus.attendance?.workHoursFormatted || 'Done'}
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Shift finished</span>
                </div>
              ) : (
                <div style={{ fontSize: '14px', color: '#64748b' }}>Ready to start your work shift today?</div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button 
                onClick={handleEmpClockIn} 
                disabled={empClockLoading || empTodayStatus?.isClockedIn || empTodayStatus?.isClockedOut}
                style={{ padding: '10px', borderRadius: '8px', background: '#10b981', color: '#fff', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', opacity: (empTodayStatus?.isClockedIn || empTodayStatus?.isClockedOut) ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Play size={16} />
                <span>Clock In</span>
              </button>
              <button 
                onClick={handleEmpClockOut} 
                disabled={empClockLoading || !empTodayStatus?.isClockedIn || empTodayStatus?.isClockedOut}
                style={{ padding: '10px', borderRadius: '8px', background: '#f43f5e', color: '#fff', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', opacity: (!empTodayStatus?.isClockedIn || empTodayStatus?.isClockedOut) ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Square size={16} />
                <span>Clock Out</span>
              </button>
            </div>
          </div>

          {/* Leaves Status Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Leave Status</span>
                <Link to="/attendance" style={{ fontSize: '12px', color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>Apply New →</Link>
              </div>
              <div style={{ display: 'flex', gap: '14px', marginTop: '6px' }}>
                <div style={{ flex: 1, background: '#f8fafc', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#f59e0b' }}>
                    {myLeaves.filter(l => l.status === 'Pending').length}
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Pending</span>
                </div>
                <div style={{ flex: 1, background: '#f8fafc', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#10b981' }}>
                    {myLeaves.filter(l => l.status === 'Approved').length}
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Approved</span>
                </div>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '12px' }}>
              {myLeaves.length > 0 ? `Latest: ${myLeaves[0].leaveType} (${myLeaves[0].status})` : 'No leave requests submitted yet.'}
            </div>
          </div>

          {/* Profile & Office Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '10px' }}>Organization Details</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Department:</span>
                <strong>{myEmp.department}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Job Title:</span>
                <strong>{myEmp.designation}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Account:</span>
                <span style={{ color: '#0e7490', fontWeight: 600 }}>Active Employee</span>
              </div>
            </div>
            <Link to="/settings" style={{ fontSize: '12px', color: '#64748b', textDecoration: 'none', marginTop: '10px' }}>
              Edit Profile Settings →
            </Link>
          </div>
        </div>

        {/* Embedded Monthly Attendance Heatmap Calendar */}
        <div style={{ marginTop: '20px' }}>
          <MonthlyAttendanceCalendar 
            employeeId={myEmp.employee_id} 
            employeeName={myEmp.name} 
          />
        </div>
      </div>
    );
  }

  // ── Render Full Admin / HR Management Dashboard ──
  return (
    <div style={{
      backgroundColor: '#f4f6f8',
      minHeight: '100vh',
      padding: '28px 36px',
      fontFamily: 'var(--font-main)',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      letterSpacing: '-0.012em',
      color: '#111827',
      boxSizing: 'border-box',
      width: '100%'
    }}>

      {/* Toast Notification Bar */}
      {alertMessage && (
        <div style={{
          background: '#fef9e7',
          color: '#7a5c00',
          padding: '12px 20px',
          borderRadius: '12px',
          marginBottom: '20px',
          fontWeight: '600',
          boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{alertMessage}</span>
          <button onClick={() => setAlertMessage('')} style={{ background: 'transparent', border: 'none', color: '#7a5c00', cursor: 'pointer', fontSize: '16px' }}>✕</button>
        </div>
      )}

      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#111827' }}>Your Workspace Dashboard</h2>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>Welcome back, Manager!</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* Search Bar */}
          <div style={{ background: 'white', padding: '8px 16px', borderRadius: '10px', border: '1px solid #103a1a', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 1px 2px rgba(87, 73, 73, 0.02)' }}>
            <span style={{ color: '#27282b', fontSize: '13px' }}>🔎︎</span>
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '13px', background: 'transparent', color: '#111827', width: '130px' }}
            />
            <span style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', color: '#6b7280', fontWeight: '600' }}>⌘F</span>
          </div>

          {/* Download Report Button */}
          <button 
            onClick={handleDownloadReport}
            style={{ 
              background: '#999494', 
              color: '#080808', 
              border: '1.5px solid #0a0a0a', 
              padding: '8px 16px', 
              borderRadius: '8px', 
              fontWeight: '500', 
              fontSize: '13px', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              boxShadow: '0 1px 2px rgba(231, 210, 210, 0.05)'
            }}
          >
            <span>Download Report</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Top 3 Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        
        {/* Card 1: Active Percentage & Bar Graph */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '22px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.01)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              style={{ fontSize: '12px', background: '#f9fafb', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e5e7eb', color: '#374151', cursor: 'pointer', outline: 'none', fontWeight: '600' }}
            >
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
            </select>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#111827', marginBottom: '2px' }}>{`${activePercentage}%`}</div>
          <p style={{ fontSize: '12px', color: '#585c63', margin: '0 0 4px 0' }}>
            ratio of the {totalEmployees} total personnel records.
          </p>
          <p style={{ fontSize: '11px', fontWeight: '700', margin: '0 0 12px 0',
            color: isUsingFallback ? '#9ca3af' : '#f5c518' }}>
            {isUsingFallback
              ? `⚠️ No new records for ${timeRange} — showing all-time data`
              : `📅 ${timeRange}: ${totalEmployees} employee${totalEmployees !== 1 ? 's' : ''} matched`}
          </p>
          
          <div style={{ height: '42px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
            {[45, 60, 35, 75, 50, 90, 65, 80, 55, 95, 70, 85, 60, 88].map((h, i) => (
              <div key={i} style={{ flex: 1, height: `${h}%`, backgroundColor: i === 9 ? '#f5c518' : '#e5e7eb', borderRadius: '2px' }}></div>
            ))}
          </div>
        </div>

        {/* Card 2: Total Workforce & Line Chart */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '22px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.01)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Total Database Staff </span>
            <span style={{ fontSize: '12px', color: '#374151', background: '#f9fafb', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e5e7eb', fontWeight: '500' }}>Records ∨</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '2px' }}>
            {totalEmployees} <span style={{ fontSize: '14px', color: '#f5c518', fontWeight: '600' }}>Active DB</span>
          </div>
          
          <div style={{ height: '42px', position: 'relative', background: '#fffbeb', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
            <svg viewBox="0 0 100 25" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <path d="M0 20 Q 25 5, 50 15 T 100 8 L 100 25 L 0 25 Z" fill="#fde68a" opacity="0.6"/>
              <path d="M0 20 Q 25 5, 50 15 T 100 8" fill="none" stroke="#f5c518" strokeWidth="2.5"/>
            </svg>
          </div>
        </div>

        {/* Card 3: Department Coverage / Circular Progress Chart */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '22px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '13px', color: '#6c7577', fontWeight: '500' }}>Department Units </span>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#111827', margin: '6px 0 2px 0' }}>{uniqueDepts} Groups</div>
            <p style={{ fontSize: '11px', color: '#4f5358', margin: 0 }}>Engineering, HR, Ops...</p>
          </div>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'conic-gradient(#f5c518 0% 75%, #e5e7eb 75% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '56px', height: '56px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', color: '#111827' }}>
              75%
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Grid layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: '20px' }}>
        
        {/* Left Section: Personnel Analytics Feed */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#111827' }}>
              {searchQuery ? `Search Results (${filteredEmployees.length})` : 'Employee Analytics Feed'}
            </h3>
            <span 
              onClick={() => setShowAllEmployees(!showAllEmployees)} 
              style={{ fontSize: '12px', color: '#111827', fontWeight: '700', cursor: 'pointer' }}
            >
              {showAllEmployees ? 'See Less ↑' : 'See More →'}
            </span>
          </div>

          {displayedEmployees.length === 0 ? (
            <p style={{ color: '#ef4444', fontSize: '13px' }}>No matching personnel records found.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              {displayedEmployees.map((emp, index) => (
                <div key={index} style={{ background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: '#111111', background: '#afafae', padding: '2px 6px', borderRadius: '4px' }}>
                      {emp.department || 'General'}
                    </span>
                    <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '500' }}>{emp.employee_id || 'EMP'}</span>
                  </div>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', margin: '0 0 2px 0', color: '#1f2937' }}>{emp.name}</h4>
                  <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 10px 0' }}>{emp.designation || 'Staff'}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af', borderTop: '1px solid #e5e7eb', paddingTop: '6px' }}>
                    <span>Salary: ₹{emp.salary || 0} LPA</span>
                    <span style={{ color: emp.status === 'On Leave' ? '#ef4444' : '#16a34a', fontWeight: '700' }}>● {emp.status || 'Active'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Section: Recent Projects & Task Completion */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#111827' }}>Workload Analytics</h3>
            <span 
              onClick={() => setShowWorkloadModal(true)} 
              style={{ fontSize: '12px', color: '#111827', fontWeight: '700', cursor: 'pointer' }}
            >
              See More →
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Task Item 1 */}
            <div style={{ background: '#f9fafb', padding: '14px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>Engineering Sprint</span>
                <span style={{ fontSize: '11px', color: '#6b7280' }}>...</span>
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '8px' }}>Deadline: 24/04/26</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                <span>Tasks Completed</span>
                <span style={{ fontWeight: '700', color: '#111827' }}>38/48</span>
              </div>
              <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '79%', background: '#f5c518', height: '100%', borderRadius: '3px' }}></div>
              </div>
            </div>

            {/* Task Item 2 */}
            <div style={{ background: '#f9fafb', padding: '14px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>HR & Operations Sync</span>
                <span style={{ fontSize: '11px', color: '#6b7280' }}>...</span>
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '8px' }}>Deadline: 28/04/26</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                <span>Tasks Completed</span>
                <span style={{ fontWeight: '700', color: '#111827' }}>40/50</span>
              </div>
              <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '80%', background: '#f5c518', height: '100%', borderRadius: '3px' }}></div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* --- WORKLOAD ANALYTICS EXPANDED MODAL --- */}
      {showWorkloadModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '450px', maxWidth: '90%', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Detailed Workload & Sprint Log</h3>
              <button onClick={() => setShowWorkloadModal(false)} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}>✕</button>
            </div>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>Additional active sprints and task management metrics across operational units:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ padding: '10px', background: '#f9fafb', borderRadius: '8px' }}>🚀 **Marketing Launchpad:** 22/25 tasks completed (Due 30/04/26)</div>
              <div style={{ padding: '10px', background: '#f9fafb', borderRadius: '8px' }}>🔒 **Security Audit & Compliance:** 12/15 tasks completed (Due 05/05/26)</div>
              <div style={{ padding: '10px', background: '#f9fafb', borderRadius: '8px' }}>☁️ **Cloud Migration Protocol:** 8/20 tasks completed (Due 15/05/26)</div>
            </div>
            <button 
              onClick={() => setShowWorkloadModal(false)}
              style={{ marginTop: '20px', width: '100%', padding: '10px', background: '#f5c518', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', color: '#000000' }}
            >
              Close Window
            </button>
          </div>
        </div>
      )}

    </div>
  );
}