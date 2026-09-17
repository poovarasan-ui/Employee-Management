import api from './api';

const employeeListCache = new Map();

export const getCachedEmployees = (params = {}) => {
  const cacheKey = JSON.stringify(params);
  return employeeListCache.get(cacheKey) || null;
};

// Fetch all employees with optional search and filters
export const getEmployees = async (params = {}) => {
  const response = await api.get('/employees', { params });
  employeeListCache.set(JSON.stringify(params), response.data);
  return response.data;
};

// Fetch single employee by ID
export const getEmployeeById = async (id) => {
  const response = await api.get(`/employees/${id}`);
  return response.data;
};

// Create a new employee
export const createEmployee = async (employeeData) => {
  const response = await api.post('/employees', employeeData);
  return response.data;
};

// Update an existing employee
export const updateEmployee = async (id, employeeData) => {
  const response = await api.put(`/employees/${id}`, employeeData);
  return response.data;
};

// Delete an employee
export const deleteEmployee = async (id) => {
  const response = await api.delete(`/employees/${id}`);
  return response.data;
};

// Fetch real-time dashboard statistics
export const getDashboardStats = async () => {
  const response = await api.get('/employees/stats');
  return response.data;
};
