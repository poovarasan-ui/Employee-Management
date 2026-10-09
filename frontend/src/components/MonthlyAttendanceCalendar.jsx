import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Clock, CheckCircle, AlertTriangle, XCircle, Info, Coffee
} from 'lucide-react';
import { getEmployeeMonthlyAttendance } from '../services/attendanceService';

export default function MonthlyAttendanceCalendar({ employeeId, employeeName }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState({ recordsMap: {}, summary: {} });
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const yearMonth = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }, [currentDate]);

  const monthLabel = useMemo(() => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentDate]);

  useEffect(() => {
    if (!employeeId) return;

    let isMounted = true;
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const data = await getEmployeeMonthlyAttendance(employeeId, yearMonth);
        if (isMounted && data.success) {
          setAttendanceData({
            recordsMap: data.recordsMap || {},
            summary: data.summary || {}
          });
        }
      } catch (err) {
        console.warn('Could not fetch monthly attendance:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAttendance();
    return () => { isMounted = false; };
  }, [employeeId, yearMonth]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const handleCurrentMonth = () => {
    setCurrentDate(new Date());
    setSelectedDay(null);
  };

  // Calendar grid calculations
  const calendarCells = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const totalDays = new Date(year, month + 1, 0).getDate();
    const todayStr = new Date().toISOString().split('T')[0];

    const cells = [];

    // Empty cells before first day
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ empty: true, key: `empty-pre-${i}` });
    }

    let calculatedAbsent = 0;

    // Actual month days
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayOfWeek = new Date(year, month, day).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
      const isToday = dateStr === todayStr;
      const isFuture = dateStr > todayStr;

      const record = attendanceData.recordsMap[dateStr];

      let status = 'Unrecorded';
      let badgeClass = 'status-unrecorded';

      if (record) {
        status = record.status || 'Present';
        if (status === 'Present') badgeClass = 'status-present';
        else if (status === 'Half Day') badgeClass = 'status-halfday';
        else if (status === 'On Leave') badgeClass = 'status-leave';
        else if (status === 'Clocked In') badgeClass = 'status-clockedin';
        else if (status === 'Absent') badgeClass = 'status-absent';
      } else {
        if (isWeekend) {
          status = 'Weekend';
          badgeClass = 'status-weekend';
        } else if (isFuture) {
          status = 'Scheduled';
          badgeClass = 'status-scheduled';
        } else {
          status = 'Absent';
          badgeClass = 'status-absent';
          calculatedAbsent++;
        }
      }

      cells.push({
        empty: false,
        key: dateStr,
        dayNumber: day,
        dateStr,
        isWeekend,
        isToday,
        isFuture,
        status,
        badgeClass,
        record
      });
    }

    return { cells, calculatedAbsent };
  }, [currentDate, attendanceData]);

  const summary = attendanceData.summary || {};

  return (
    <div className="attendance-calendar-card">
      {/* Calendar Header with Controls */}
      <div className="attendance-calendar-header">
        <div className="calendar-title-wrap">
          <div className="calendar-icon-badge">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h3 className="calendar-heading">Monthly Attendance Heatmap</h3>
            <p className="calendar-subheading">
              Tracking monthly shifts, leaves, and daily working hours for {employeeName || 'Employee'}
            </p>
          </div>
        </div>

        <div className="calendar-nav-controls">
          <button 
            type="button" 
            className="calendar-today-btn" 
            onClick={handleCurrentMonth}
            title="Go to Current Month"
          >
            This Month
          </button>
          <div className="calendar-arrows-wrap">
            <button 
              type="button" 
              className="calendar-arrow-btn" 
              onClick={handlePrevMonth}
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="calendar-month-text">{monthLabel}</span>
            <button 
              type="button" 
              className="calendar-arrow-btn" 
              onClick={handleNextMonth}
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="calendar-summary-row">
        <div className="cal-stat-pill stat-present">
          <span className="stat-bullet bg-emerald" />
          <span className="stat-num">{summary.presentDays || 0}</span>
          <span className="stat-label">Present</span>
        </div>
        <div className="cal-stat-pill stat-halfday">
          <span className="stat-bullet bg-amber" />
          <span className="stat-num">{summary.halfDays || 0}</span>
          <span className="stat-label">Half Day</span>
        </div>
        <div className="cal-stat-pill stat-leave">
          <span className="stat-bullet bg-purple" />
          <span className="stat-num">{summary.leaveDays || 0}</span>
          <span className="stat-label">On Leave</span>
        </div>
        <div className="cal-stat-pill stat-absent">
          <span className="stat-bullet bg-rose" />
          <span className="stat-num">{calendarCells.calculatedAbsent || 0}</span>
          <span className="stat-label">Absent</span>
        </div>
        <div className="cal-stat-pill stat-hours">
          <Clock size={14} className="text-cyan" />
          <span className="stat-num">{summary.totalWorkHours || 0}h</span>
          <span className="stat-label">Total Logged</span>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="calendar-weekdays-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, idx) => (
          <div key={d} className={`calendar-weekday-cell ${idx === 0 || idx === 6 ? 'weekend-day' : ''}`}>
            {d}
          </div>
        ))}
      </div>

      {/* 35/42 Cell Monthly Heatmap Grid */}
      <div className="calendar-days-grid">
        {calendarCells.cells.map((cell) => {
          if (cell.empty) {
            return <div key={cell.key} className="calendar-day-cell cell-empty" />;
          }

          const hasRecord = !!cell.record;
          const isSelected = selectedDay && selectedDay.dateStr === cell.dateStr;

          return (
            <div
              key={cell.key}
              onClick={() => setSelectedDay(cell)}
              className={`calendar-day-cell ${cell.badgeClass} ${cell.isToday ? 'cell-today' : ''} ${isSelected ? 'cell-selected' : ''}`}
            >
              <div className="day-cell-top">
                <span className="day-number">{cell.dayNumber}</span>
                {cell.isToday && <span className="today-badge">TODAY</span>}
              </div>

              <div className="day-cell-content">
                <span className={`day-status-pill ${cell.badgeClass}`}>
                  {cell.status}
                </span>

                {hasRecord && cell.record.workHoursFormatted && (
                  <span className="day-hours-pill">
                    <Clock size={10} />
                    {cell.record.workHoursFormatted}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Popup Drawer / Box for Selected Day */}
      {selectedDay && (
        <div className="calendar-day-popover">
          <div className="popover-header">
            <div className="popover-title">
              <CalendarIcon size={16} />
              <span>
                {new Date(selectedDay.dateStr + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            <button 
              type="button" 
              className="popover-close-btn" 
              onClick={() => setSelectedDay(null)}
            >
              ×
            </button>
          </div>

          <div className="popover-body">
            <div className="popover-row">
              <span className="popover-label">Status:</span>
              <span className={`day-status-pill ${selectedDay.badgeClass}`}>
                {selectedDay.status}
              </span>
            </div>

            {selectedDay.record ? (
              <>
                <div className="popover-row">
                  <span className="popover-label">Clock In:</span>
                  <span className="popover-val">
                    {selectedDay.record.clockIn 
                      ? new Date(selectedDay.record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                      : 'N/A'}
                  </span>
                </div>
                <div className="popover-row">
                  <span className="popover-label">Clock Out:</span>
                  <span className="popover-val">
                    {selectedDay.record.clockOut 
                      ? new Date(selectedDay.record.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                      : (selectedDay.record.clockIn ? 'Currently Clocked In' : 'N/A')}
                  </span>
                </div>
                <div className="popover-row">
                  <span className="popover-label">Duration:</span>
                  <span className="popover-val text-emerald">
                    {selectedDay.record.workHoursFormatted || (selectedDay.record.workHours ? `${selectedDay.record.workHours}h` : '0h 0m')}
                  </span>
                </div>
                {selectedDay.record.notes && (
                  <div className="popover-row notes-row">
                    <span className="popover-label">Notes:</span>
                    <span className="popover-val">{selectedDay.record.notes}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="popover-empty-hint">
                {selectedDay.isWeekend 
                  ? 'Official company weekend / rest day.' 
                  : selectedDay.isFuture 
                    ? 'Upcoming workday on schedule.' 
                    : 'No check-in recorded for this workday (Marked Absent).'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Legend Footer */}
      <div className="calendar-legend-bar">
        <span className="legend-item"><span className="legend-box bg-emerald" /> Present</span>
        <span className="legend-item"><span className="legend-box bg-amber" /> Half Day</span>
        <span className="legend-item"><span className="legend-box bg-purple" /> On Leave</span>
        <span className="legend-item"><span className="legend-box bg-rose" /> Absent</span>
        <span className="legend-item"><span className="legend-box bg-muted" /> Weekend / Rest</span>
      </div>
    </div>
  );
}
