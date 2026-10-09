import api from './api';

// Apply for leave
export const applyLeave = async (leaveData) => {
  const response = await api.post('/leaves/apply', leaveData);
  return response.data;
};

// Get leave requests with optional filters (status, employee_id)
export const getLeaves = async (params = {}) => {
  const response = await api.get('/leaves', { params });
  return response.data;
};

// Approve or Reject a leave request
export const updateLeaveStatus = async (id, status, adminComment = '') => {
  const response = await api.put(`/leaves/${id}/status`, { status, adminComment });
  return response.data;
};

// Get leave statistics
export const getLeaveStats = async () => {
  const response = await api.get('/leaves/stats');
  return response.data;
};
