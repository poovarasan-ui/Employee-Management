import api from './api';

// Clock In for an employee
export const clockIn = async (employeeData) => {
  const response = await api.post('/attendance/clock-in', employeeData);
  return response.data;
};

// Clock Out for an employee
export const clockOut = async (employeeData) => {
  const response = await api.post('/attendance/clock-out', employeeData);
  return response.data;
};

// Get today's clock in/out status
export const getTodayStatus = async (employeeId) => {
  const response = await api.get(`/attendance/today/${employeeId}`);
  return response.data;
};

// Get all attendance logs (with optional query filters: date, month, employee_id, status)
export const getAttendanceLogs = async (params = {}) => {
  const response = await api.get('/attendance', { params });
  return response.data;
};

// Get monthly attendance for an employee (used for the calendar / heatmap)
export const getEmployeeMonthlyAttendance = async (employeeId, month) => {
  const response = await api.get(`/attendance/monthly/${employeeId}`, {
    params: { month }
  });
  return response.data;
};

// Admin manual attendance entry
export const markManualAttendance = async (attendanceData) => {
  const response = await api.post('/attendance/manual', attendanceData);
  return response.data;
};
