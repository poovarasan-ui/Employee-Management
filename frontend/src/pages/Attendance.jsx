import React, { useState, useEffect, useRef } from 'react';
import {
  Clock, Calendar, UserCheck, CheckCircle, AlertTriangle,
  XCircle, Filter, Plus, Search, ArrowRight, Play, Square,
  Building2, User, ChevronRight, FileText, Check, X, MessageSquare,
  ShieldCheck, RefreshCw, CalendarDays
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  clockIn, clockOut, getTodayStatus, getAttendanceLogs, markManualAttendance
} from '../services/attendanceService';
import {
  getLeaves, applyLeave, updateLeaveStatus, getLeaveStats
} from '../services/leaveService';
import { getEmployees } from '../services/employeeService';
import { getCurrentUser, isEmployee, isAdminOrHr } from '../utils/auth';
import MonthlyAttendanceCalendar from '../components/MonthlyAttendanceCalendar';

export default function Attendance() {
  const currentUser = getCurrentUser();
  const userIsEmp = isEmployee();

  // Navigation active tab
  const [activeTab, setActiveTab] = useState('clock'); // 'clock' | 'leaves' | 'logs'

  // Live Digital Clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  // Employees list for selection
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  // Clock Tab State
  const [todayStatus, setTodayStatus] = useState(null);
  const [clockLoading, setClockLoading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [todayTeamLogs, setTodayTeamLogs] = useState([]);

  // Leave Management State
  const [leaves, setLeaves] = useState([]);
  const [leaveStats, setLeaveStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [leaveFilter, setLeaveFilter] = useState('All');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    employee_id: '',
    leaveType: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [reviewModalData, setReviewModalData] = useState(null); // { leave, action: 'Approved' | 'Rejected', comment: '' }

  // Attendance Logs State
  const [logs, setLogs] = useState([]);
  const [logFilterDate, setLogFilterDate] = useState('');
  const [logFilterStatus, setLogFilterStatus] = useState('All');
  const [logSearch, setLogSearch] = useState('');
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    clockIn: '09:00',
    clockOut: '17:30',
    notes: 'Admin manual adjustment'
  });

  // Ticking digital clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch employees list
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await getEmployees();
        if (data.success && Array.isArray(data.employees) && data.employees.length > 0) {
          setEmployees(data.employees);
          if (userIsEmp) {
            const myEmp = data.employees.find(e =>
              (currentUser?.employee_id && e.employee_id === currentUser.employee_id) ||
              (currentUser?.email && e.email?.toLowerCase() === currentUser.email?.toLowerCase())
            ) || {
              employee_id: currentUser?.employee_id || data.employees[0].employee_id,
              name: currentUser?.username || data.employees[0].name,
              department: data.employees[0].department || 'General',
              designation: data.employees[0].designation || 'Team Member'
            };
            setSelectedEmployeeId(myEmp.employee_id);
            setLeaveForm(prev => ({ ...prev, employee_id: myEmp.employee_id }));
          } else if (!selectedEmployeeId) {
            setSelectedEmployeeId(data.employees[0].employee_id);
          }
        } else if (userIsEmp) {
          const fallbackId = currentUser?.employee_id || 'EMP-SELF';
          setSelectedEmployeeId(fallbackId);
          setLeaveForm(prev => ({ ...prev, employee_id: fallbackId }));
        }
      } catch (err) {
        console.warn('Could not load employees:', err);
      }
    };
    loadEmployees();
  }, [userIsEmp]);

  // Fetch selected employee's today status
  const fetchTodayStatus = async (empId) => {
    if (!empId) return;
    try {
      const data = await getTodayStatus(empId);
      if (data.success) {
        setTodayStatus(data);
        if (data.isClockedIn && data.attendance?.clockIn) {
          const diffSec = Math.floor((Date.now() - new Date(data.attendance.clockIn).getTime()) / 1000);
          setElapsedSeconds(Math.max(0, diffSec));
        } else {
          setElapsedSeconds(0);
        }
      }
    } catch (err) {
      console.warn('Could not fetch today status:', err);
    }
  };

  useEffect(() => {
    if (selectedEmployeeId) {
      fetchTodayStatus(selectedEmployeeId);
    }
  }, [selectedEmployeeId]);

  // Live timer tick when clocked in
  useEffect(() => {
    let timer = null;
    if (todayStatus?.isClockedIn) {
      timer = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [todayStatus?.isClockedIn]);

  // Load team logs for today
  const loadTodayTeam = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const data = await getAttendanceLogs({ date: todayStr });
      if (data.success) {
        setTodayTeamLogs(data.records || []);
      }
    } catch (err) {
      console.warn('Could not load today team logs:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'clock') {
      loadTodayTeam();
    }
  }, [activeTab]);

  // Load leaves
  const loadLeaves = async () => {
    try {
      const params = {};
      if (leaveFilter !== 'All') params.status = leaveFilter;
      if (userIsEmp && selectedEmployeeId) {
        params.employee_id = selectedEmployeeId;
      }

      const [leavesRes, statsRes] = await Promise.all([
        getLeaves(params),
        getLeaveStats()
      ]);
      if (leavesRes.success) setLeaves(leavesRes.leaves || []);
      if (statsRes.success) setLeaveStats(statsRes.stats || { total: 0, pending: 0, approved: 0, rejected: 0 });
    } catch (err) {
      console.warn('Could not load leaves:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'leaves') {
      loadLeaves();
    }
  }, [activeTab, leaveFilter]);

  // Load logs
  const loadLogs = async () => {
    try {
      const params = {};
      if (logFilterDate) params.date = logFilterDate;
      if (logFilterStatus !== 'All') params.status = logFilterStatus;
      if (userIsEmp && selectedEmployeeId) {
        params.employee_id = selectedEmployeeId;
      }
      const data = await getAttendanceLogs(params);
      if (data.success) {
        setLogs(data.records || []);
      }
    } catch (err) {
      console.warn('Could not load logs:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'logs') {
      loadLogs();
    }
  }, [activeTab, logFilterDate, logFilterStatus]);

  // Selected employee object
  const currentEmployee = employees.find(e => e.employee_id === selectedEmployeeId) || employees[0] || null;

  // Handle Clock In
  const handleClockIn = async () => {
    if (!currentEmployee) {
      toast.warning('Please select an employee first.');
      return;
    }
    try {
      setClockLoading(true);
      const res = await clockIn({
        employee_id: currentEmployee.employee_id,
        employee_name: currentEmployee.name,
        department: currentEmployee.department
      });
      if (res.success) {
        toast.success(res.message || 'Clocked in successfully!');
        await fetchTodayStatus(currentEmployee.employee_id);
        await loadTodayTeam();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to clock in.');
    } finally {
      setClockLoading(false);
    }
  };

  // Handle Clock Out
  const handleClockOut = async () => {
    if (!currentEmployee) {
      toast.warning('Please select an employee first.');
      return;
    }
    try {
      setClockLoading(true);
      const res = await clockOut({
        employee_id: currentEmployee.employee_id
      });
      if (res.success) {
        toast.success(res.message || 'Clocked out successfully!');
        await fetchTodayStatus(currentEmployee.employee_id);
        await loadTodayTeam();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to clock out.');
    } finally {
      setClockLoading(false);
    }
  };

  // Format seconds to HH:MM:SS
  const formatSeconds = (sec) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, '0');
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${h}h ${m}m ${s}s`;
  };

  // Submit Leave Request
  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    if (!leaveForm.employee_id || !leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
      toast.warning('Please fill in all required leave fields.');
      return;
    }
    try {
      setSubmittingLeave(true);
      const emp = employees.find(e => e.employee_id === leaveForm.employee_id);
      const res = await applyLeave({
        ...leaveForm,
        employee_name: emp ? emp.name : 'Employee',
        department: emp ? emp.department : ''
      });
      if (res.success) {
        toast.success('Leave application submitted for approval!');
        setShowApplyModal(false);
        setLeaveForm({
          employee_id: '',
          leaveType: 'Casual Leave',
          startDate: '',
          endDate: '',
          reason: ''
        });
        loadLeaves();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit leave.');
    } finally {
      setSubmittingLeave(false);
    }
  };

  // Submit Review (Approve / Reject)
  const handleConfirmReview = async () => {
    if (!reviewModalData) return;
    try {
      const { leave, action, comment } = reviewModalData;
      const res = await updateLeaveStatus(leave._id, action, comment);
      if (res.success) {
        toast.success(res.message || `Leave marked as ${action}`);
        setReviewModalData(null);
        loadLeaves();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update leave status.');
    }
  };

  // Submit Manual Attendance
  const handleSaveManualAttendance = async (e) => {
    e.preventDefault();
    if (!manualForm.employee_id || !manualForm.date) {
      toast.warning('Please provide employee and date.');
      return;
    }
    try {
      const emp = employees.find(e => e.employee_id === manualForm.employee_id);
      const clockInDate = manualForm.clockIn ? `${manualForm.date}T${manualForm.clockIn}:00` : null;
      const clockOutDate = manualForm.clockOut ? `${manualForm.date}T${manualForm.clockOut}:00` : null;

      const res = await markManualAttendance({
        employee_id: manualForm.employee_id,
        employee_name: emp ? emp.name : 'Employee',
        department: emp ? emp.department : '',
        date: manualForm.date,
        status: manualForm.status,
        clockIn: clockInDate,
        clockOut: clockOutDate,
        notes: manualForm.notes
      });

      if (res.success) {
        toast.success('Attendance record updated successfully!');
        setShowManualModal(false);
        loadLogs();
        if (manualForm.employee_id === selectedEmployeeId) {
          fetchTodayStatus(selectedEmployeeId);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save manual attendance.');
    }
  };

  // Filtered Logs
  const filteredLogs = logs.filter(log => {
    if (!logSearch.trim()) return true;
    const q = logSearch.toLowerCase();
    return (
      log.employee_name?.toLowerCase().includes(q) ||
      log.employee_id?.toLowerCase().includes(q) ||
      log.department?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="attendance-page-container">
      {/* Top Banner Header */}
      <div className="attendance-header-card">
        <div className="attendance-header-left">
          <div className="attendance-header-icon">
            <Clock size={28} />
          </div>
          <div>
            <h1 className="attendance-main-title">
              {userIsEmp ? 'My Attendance & Leave Portal' : 'Attendance & Leave Management'}
            </h1>
            <p className="attendance-main-subtitle">
              {userIsEmp
                ? 'Record your daily shift punches, apply for leaves, and inspect your monthly calendar'
                : 'Daily clock-in/out, live shift duration calculations, and HR leave request approvals'}
            </p>
          </div>
        </div>

        {/* Real-time Digital Clock & Calendar Widget */}
        <div className="live-clock-widget">
          <div className="digital-time">
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="digital-date">
            <CalendarDays size={14} />
            <span>{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="attendance-tab-bar">
        <button
          type="button"
          className={`attendance-tab-btn ${activeTab === 'clock' ? 'active' : ''}`}
          onClick={() => setActiveTab('clock')}
        >
          <Clock size={18} />
          <span>{userIsEmp ? 'My Punch Clock' : 'Daily Punch Clock'}</span>
        </button>

        <button
          type="button"
          className={`attendance-tab-btn ${activeTab === 'leaves' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaves')}
        >
          <FileText size={18} />
          <span>{userIsEmp ? 'My Leave Requests' : 'Leave Requests & Approvals'}</span>
          {leaveStats.pending > 0 && (
            <span className="tab-counter-badge">{leaveStats.pending}</span>
          )}
        </button>

        <button
          type="button"
          className={`attendance-tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <Calendar size={18} />
          <span>{userIsEmp ? 'My Attendance & Calendar' : 'Attendance Logs & History'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DAILY CLOCK IN / CLOCK OUT */}
      {/* ========================================================================= */}
      {activeTab === 'clock' && (
        <div className="clock-tab-content">
          <div className="clock-grid-layout">
            {/* Left: Punch Card */}
            <div className="time-clock-card">
              <div className="time-clock-header">
                <span className="section-badge" style={userIsEmp ? { background: 'rgba(6, 182, 212, 0.15)', color: '#0e7490' } : {}}>
                  {userIsEmp ? 'Personal Punch Station' : 'Live Time Clock'}
                </span>

                {!userIsEmp ? (
                  <div className="employee-picker-wrap">
                    <label htmlFor="clock-employee-select">Employee:</label>
                    <select
                      id="clock-employee-select"
                      value={selectedEmployeeId}
                      onChange={(e) => setSelectedEmployeeId(e.target.value)}
                      className="employee-select-input"
                    >
                      {employees.map(emp => (
                        <option key={emp.employee_id} value={emp.employee_id}>
                          {emp.employee_id} - {emp.name} ({emp.department})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Self: <strong style={{ color: 'var(--text-main)' }}>{currentEmployee?.name || currentUser?.username}</strong>
                  </div>
                )}
              </div>

              {/* Employee Quick Info */}
              {currentEmployee && (
                <div className="punch-emp-summary">
                  <div className="punch-emp-avatar">
                    {currentEmployee.name ? currentEmployee.name.charAt(0).toUpperCase() : 'E'}
                  </div>
                  <div>
                    <h3 className="punch-emp-name">{currentEmployee.name}</h3>
                    <p className="punch-emp-role">{currentEmployee.designation} • {currentEmployee.department}</p>
                  </div>
                </div>
              )}

              {/* Clock Status Display */}
              <div className="clock-status-monitor">
                {todayStatus?.isClockedIn ? (
                  <div className="status-monitor-box clocked-in">
                    <div className="pulse-indicator">
                      <span className="pulse-dot" />
                      <span className="pulse-text">CURRENTLY CLOCKED IN</span>
                    </div>
                    <div className="live-elapsed-timer">
                      {formatSeconds(elapsedSeconds)}
                    </div>
                    <p className="clock-timestamp-hint">
                      Clocked in at {new Date(todayStatus.attendance.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ) : todayStatus?.isClockedOut ? (
                  <div className="status-monitor-box completed-shift">
                    <CheckCircle size={28} className="text-emerald" />
                    <h4 className="shift-done-title">Shift Completed for Today</h4>
                    <div className="shift-summary-pill">
                      <span>Total Logged: </span>
                      <strong>{todayStatus.attendance?.workHoursFormatted || '0h 0m'}</strong>
                      <span className="status-tag-pill">{todayStatus.attendance?.status}</span>
                    </div>
                    <p className="clock-timestamp-hint">
                      In: {new Date(todayStatus.attendance.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {'  •  '}
                      Out: {new Date(todayStatus.attendance.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ) : (
                  <div className="status-monitor-box not-clocked">
                    <Clock size={28} className="text-amber" />
                    <h4 className="not-clocked-title">Not Clocked In Today</h4>
                    <p className="clock-timestamp-hint">
                      Click the "Clock In" button below to begin recording work hours for today.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons: Clock In & Clock Out */}
              <div className="clock-actions-row">
                <button
                  type="button"
                  className="clock-btn clock-in-btn"
                  onClick={handleClockIn}
                  disabled={clockLoading || todayStatus?.isClockedIn || todayStatus?.isClockedOut}
                >
                  <Play size={20} />
                  <span>Clock In</span>
                </button>

                <button
                  type="button"
                  className="clock-btn clock-out-btn"
                  onClick={handleClockOut}
                  disabled={clockLoading || !todayStatus?.isClockedIn || todayStatus?.isClockedOut}
                >
                  <Square size={20} />
                  <span>Clock Out</span>
                </button>
              </div>

              {/* Automatic Work Hours Note */}
              <div className="clock-rule-note">
                <ShieldCheck size={16} />
                <span>
                  Automatic work calculation: <strong>&gt;= 7.5 hrs = Full Day Present</strong>, <strong>4 - 7.4 hrs = Half Day</strong>.
                </span>
              </div>
            </div>

            {/* Right: Team Live Attendance Today */}
            <div className="today-team-roster-card">
              <div className="roster-header">
                <div>
                  <h3 className="roster-title">Today's Team Attendance</h3>
                  <p className="roster-subtitle">Live check-in activity for {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
            
              </div>

              {todayTeamLogs.length === 0 ? (
                <div className="roster-empty-state">
                  <UserCheck size={36} />
                  <p>No check-ins recorded yet today.</p>
                  <span>Employees will show up here once they clock in.</span>
                </div>
              ) : (
                <div className="roster-list">
                  {todayTeamLogs.map(log => (
                    <div key={log._id} className="roster-item">
                      <div className="roster-emp-left">
                        <div className="roster-avatar">
                          {log.employee_name ? log.employee_name.charAt(0).toUpperCase() : 'E'}
                        </div>
                        <div>
                          <div className="roster-emp-name">{log.employee_name}</div>
                          <div className="roster-emp-id">{log.employee_id} • {log.department || 'General'}</div>
                        </div>
                      </div>

                      <div className="roster-emp-right">
                        <span className={`status-badge-compact ${log.status === 'Clocked In' ? 'status-active-pulse' :
                            log.status === 'Present' ? 'status-present' : 'status-halfday'
                          }`}>
                          {log.status}
                        </span>
                        <div className="roster-time-info">
                          <span>In: {log.clockIn ? new Date(log.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</span>
                          {log.workHoursFormatted && <span className="text-emerald font-semibold">({log.workHoursFormatted})</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LEAVE REQUESTS & APPROVAL WORKFLOW */}
      {/* ========================================================================= */}
      {activeTab === 'leaves' && (
        <div className="leaves-tab-content">
          {/* Top KPI Cards */}
          <div className="leave-kpi-grid">
            <div className="leave-kpi-card kpi-pending">
              <div className="kpi-icon-wrap">
                <AlertTriangle size={20} />
              </div>
              <div className="kpi-meta">
                <span className="kpi-value">{leaveStats.pending}</span>
                <span className="kpi-label">Pending Approval</span>
              </div>
            </div>

            <div className="leave-kpi-card kpi-approved">
              <div className="kpi-icon-wrap">
                <CheckCircle size={20} />
              </div>
              <div className="kpi-meta">
                <span className="kpi-value">{leaveStats.approved}</span>
                <span className="kpi-label">Approved Leaves</span>
              </div>
            </div>

            <div className="leave-kpi-card kpi-rejected">
              <div className="kpi-icon-wrap">
                <XCircle size={20} />
              </div>
              <div className="kpi-meta">
                <span className="kpi-value">{leaveStats.rejected}</span>
                <span className="kpi-label">Rejected Requests</span>
              </div>
            </div>

            <div className="leave-kpi-card kpi-total">
              <div className="kpi-icon-wrap">
                <FileText size={20} />
              </div>
              <div className="kpi-meta">
                <span className="kpi-value">{leaveStats.total}</span>
                <span className="kpi-label">Total Applications</span>
              </div>
            </div>
          </div>

          {/* Action & Filter Toolbar */}
          <div className="leaves-toolbar">
            <div className="leave-filter-pills">
              {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
                <button
                  key={status}
                  type="button"
                  className={`filter-pill-btn ${leaveFilter === status ? 'active' : ''}`}
                  onClick={() => setLeaveFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="btn-apply-leave"
              onClick={() => setShowApplyModal(true)}
            >
              <Plus size={16} />
              <span>Apply for Leave</span>
            </button>
          </div>

          {/* Leaves List / Cards */}
          {leaves.length === 0 ? (
            <div className="empty-state-card">
              <FileText size={42} />
              <h3>No Leave Applications Found</h3>
              <p>There are no {leaveFilter !== 'All' ? leaveFilter.toLowerCase() : ''} leave requests matching your filter.</p>
              <button
                type="button"
                className="btn-primary-compact"
                onClick={() => setShowApplyModal(true)}
              >
                <Plus size={16} />
                <span>Submit Leave Request</span>
              </button>
            </div>
          ) : (
            <div className="leaves-cards-grid">
              {leaves.map(leave => (
                <div key={leave._id} className="leave-item-card">
                  <div className="leave-card-top">
                    <div className="leave-emp-info">
                      <div className="leave-avatar">
                        {leave.employee_name ? leave.employee_name.charAt(0).toUpperCase() : 'E'}
                      </div>
                      <div>
                        <h4 className="leave-emp-name">{leave.employee_name}</h4>
                        <span className="leave-emp-dept">{leave.employee_id} • {leave.department || 'General'}</span>
                      </div>
                    </div>

                    <span className={`leave-status-badge status-${leave.status.toLowerCase()}`}>
                      {leave.status}
                    </span>
                  </div>

                  <div className="leave-type-pill-wrap">
                    <span className="leave-type-chip">{leave.leaveType}</span>
                    <span className="leave-days-chip">{leave.days} {leave.days === 1 ? 'Day' : 'Days'}</span>
                  </div>

                  <div className="leave-date-range">
                    <Calendar size={14} />
                    <span>
                      {new Date(leave.startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {'  →  '}
                      {new Date(leave.endDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="leave-reason-box">
                    <strong>Reason:</strong> {leave.reason}
                  </div>

                  {leave.adminComment && (
                    <div className="leave-admin-comment-box">
                      <MessageSquare size={13} />
                      <span>Review note: {leave.adminComment} ({leave.reviewedBy || 'HR'})</span>
                    </div>
                  )}

                  {/* Actions for Pending Requests (Admin/HR Only) */}
                  {leave.status === 'Pending' && !userIsEmp && (
                    <div className="leave-actions-bar">
                      <button
                        type="button"
                        className="btn-approve-action"
                        onClick={() => setReviewModalData({ leave, action: 'Approved', comment: '' })}
                      >
                        <Check size={16} />
                        <span>Approve</span>
                      </button>

                      <button
                        type="button"
                        className="btn-reject-action"
                        onClick={() => setReviewModalData({ leave, action: 'Rejected', comment: '' })}
                      >
                        <X size={16} />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ATTENDANCE LOGS & HISTORY */}
      {/* ========================================================================= */}
      {activeTab === 'logs' && (
        <div className="logs-tab-content">
          <div className="logs-toolbar">
            <div className="logs-search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search employee name, ID, or department..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
              />
            </div>

            <div className="logs-filters-group">
              <input
                type="date"
                className="logs-date-input"
                value={logFilterDate}
                onChange={(e) => setLogFilterDate(e.target.value)}
                title="Filter by Date"
              />

              <select
                className="logs-status-select"
                value={logFilterStatus}
                onChange={(e) => setLogFilterStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Half Day">Half Day</option>
                <option value="On Leave">On Leave</option>
                <option value="Clocked In">Clocked In</option>
              </select>

              {!userIsEmp && (
                <button
                  type="button"
                  className="btn-manual-add"
                  onClick={() => setShowManualModal(true)}
                >
                  <Plus size={16} />
                  <span>Manual Entry</span>
                </button>
              )}
            </div>
          </div>

          {/* If Employee, also display their interactive Monthly Heatmap Calendar */}
          {userIsEmp && (
            <div style={{ marginBottom: '24px' }}>
              <MonthlyAttendanceCalendar
                employeeId={selectedEmployeeId || currentUser?.employee_id}
                employeeName={currentEmployee?.name || currentUser?.username}
              />
            </div>
          )}

          {/* Logs Table */}
          <div className="attendance-table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Total Duration</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No attendance records found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log._id}>
                      <td>
                        <div className="table-emp-cell">
                          <div className="table-avatar">
                            {log.employee_name ? log.employee_name.charAt(0).toUpperCase() : 'E'}
                          </div>
                          <div>
                            <strong>{log.employee_name}</strong>
                            <div className="text-subtle-sm">{log.employee_id} • {log.department || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {new Date(log.date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </td>
                      <td>
                        {log.clockIn
                          ? new Date(log.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '--'}
                      </td>
                      <td>
                        {log.clockOut
                          ? new Date(log.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : (log.clockIn ? <span className="text-cyan font-semibold">Active</span> : '--')}
                      </td>
                      <td>
                        <span className="font-semibold text-emerald">
                          {log.workHoursFormatted || (log.workHours ? `${log.workHours}h` : '--')}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge-compact ${log.status === 'Present' ? 'status-present' :
                            log.status === 'Half Day' ? 'status-halfday' :
                              log.status === 'On Leave' ? 'status-leave' :
                                log.status === 'Clocked In' ? 'status-active-pulse' : 'status-absent'
                          }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="text-subtle-sm">
                        {log.notes || '--'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: APPLY FOR LEAVE */}
      {/* ========================================================================= */}
      {showApplyModal && (
        <div className="modal-backdrop">
          <div className="attendance-modal-card">
            <div className="modal-header">
              <div className="modal-header-title">
                <FileText size={20} />
                <h3>Apply for Leave</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowApplyModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitLeave} className="modal-form-body">
              <div className="form-group">
                <label>Employee *</label>
                {userIsEmp ? (
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={`${currentEmployee?.name || currentUser?.username} (${currentEmployee?.employee_id || currentUser?.employee_id || 'Self'})`}
                    className="modal-form-input"
                    style={{ background: '#f4f4f5', cursor: 'not-allowed', color: '#111111', fontWeight: 600 }}
                  />
                ) : (
                  <select
                    required
                    value={leaveForm.employee_id}
                    onChange={(e) => setLeaveForm({ ...leaveForm, employee_id: e.target.value })}
                    className="modal-form-input"
                  >
                    <option value="">-- Choose Employee --</option>
                    {employees.map(emp => (
                      <option key={emp.employee_id} value={emp.employee_id}>
                        {emp.employee_id} - {emp.name} ({emp.department})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label>Leave Type *</label>
                <select
                  required
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                  className="modal-form-input"
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Maternity/Paternity Leave">Maternity/Paternity Leave</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                </select>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="modal-form-input"
                  />
                </div>
                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="modal-form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Reason for Leave *</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Explain reason for leave..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="modal-form-input"
                />
              </div>

              <div className="modal-footer-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setShowApplyModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLeave}
                  className="btn-modal-submit"
                >
                  {submittingLeave ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: HR APPROVE / REJECT LEAVE WITH NOTE */}
      {/* ========================================================================= */}
      {reviewModalData && (
        <div className="modal-backdrop">
          <div className="attendance-modal-card">
            <div className="modal-header">
              <div className="modal-header-title">
                {reviewModalData.action === 'Approved' ? (
                  <CheckCircle size={20} className="text-emerald" />
                ) : (
                  <XCircle size={20} className="text-rose" />
                )}
                <h3>{reviewModalData.action} Leave Request</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setReviewModalData(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-form-body">
              <p style={{ color: 'var(--text-muted)', marginBottom: '14px', fontSize: '14px' }}>
                You are about to mark this request as <strong>{reviewModalData.action}</strong> for{' '}
                <strong>{reviewModalData.leave.employee_name}</strong> (
                {reviewModalData.leave.leaveType}, {reviewModalData.leave.days} Days).
              </p>

              <div className="form-group">
                <label>Reviewer Feedback / Note (Optional):</label>
                <textarea
                  rows="3"
                  placeholder={`Optional note regarding this ${reviewModalData.action.toLowerCase()} decision...`}
                  value={reviewModalData.comment}
                  onChange={(e) => setReviewModalData({ ...reviewModalData, comment: e.target.value })}
                  className="modal-form-input"
                />
              </div>

              <div className="modal-footer-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setReviewModalData(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`btn-modal-submit ${reviewModalData.action === 'Approved' ? 'bg-emerald' : 'bg-rose'}`}
                  onClick={handleConfirmReview}
                >
                  Confirm {reviewModalData.action}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: MANUAL ATTENDANCE ENTRY */}
      {/* ========================================================================= */}
      {showManualModal && (
        <div className="modal-backdrop">
          <div className="attendance-modal-card">
            <div className="modal-header">
              <div className="modal-header-title">
                <Clock size={20} />
                <h3>Manual Attendance Entry / Adjustment</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowManualModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveManualAttendance} className="modal-form-body">
              <div className="form-group">
                <label>Employee *</label>
                <select
                  required
                  value={manualForm.employee_id}
                  onChange={(e) => setManualForm({ ...manualForm, employee_id: e.target.value })}
                  className="modal-form-input"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.employee_id} value={emp.employee_id}>
                      {emp.employee_id} - {emp.name} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    required
                    value={manualForm.date}
                    onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                    className="modal-form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    value={manualForm.status}
                    onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
                    className="modal-form-input"
                  >
                    <option value="Present">Present</option>
                    <option value="Half Day">Half Day</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Clock In Time</label>
                  <input
                    type="time"
                    value={manualForm.clockIn}
                    onChange={(e) => setManualForm({ ...manualForm, clockIn: e.target.value })}
                    className="modal-form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Clock Out Time</label>
                  <input
                    type="time"
                    value={manualForm.clockOut}
                    onChange={(e) => setManualForm({ ...manualForm, clockOut: e.target.value })}
                    className="modal-form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Admin Note</label>
                <input
                  type="text"
                  placeholder="Reason for manual adjustment..."
                  value={manualForm.notes}
                  onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                  className="modal-form-input"
                />
              </div>

              <div className="modal-footer-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setShowManualModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modal-submit"
                >
                  Save Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
