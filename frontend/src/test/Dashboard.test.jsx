/**
 * Dashboard.test.jsx
 * Unit tests for the Dashboard page component.
 * Tests cover: rendering, time-range filter, search, metrics, fallback,
 *              See More toggle, Workload modal, and Download Report.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// ── Mock the employee service so tests never hit the real API ──────────────
vi.mock('../services/employeeService', () => ({
  getEmployees: vi.fn(),
}));

import { getEmployees } from '../services/employeeService';
import Dashboard from '../pages/Dashboard';

// ── Helpers ────────────────────────────────────────────────────────────────

/** Build a fake employee with optional overrides */
const makeEmployee = (overrides = {}) => ({
  _id: Math.random().toString(36).slice(2),
  employee_id: 'EMP-001',
  name: 'Test User',
  email: 'test@test.com',
  department: 'Engineering',
  designation: 'Software Engineer',
  salary: 800000,
  status: 'Active',
  createdAt: new Date().toISOString(), // today by default
  joining_date: '2022-01-01',
  ...overrides,
});

/** Date helpers */
const today = () => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
};
const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
};
const lastMonth = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
};

// ── Test Suite ──────────────────────────────────────────────────────────────

describe('Dashboard Page', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    // Default: API returns empty -> component uses FALLBACK_EMPLOYEES
    getEmployees.mockResolvedValue({ success: false, employees: [] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── 1. RENDERING ──────────────────────────────────────────────────────────

  describe('Rendering', () => {
    it('renders the main heading', async () => {
      render(<Dashboard />);
      expect(await screen.findByText('Your Workspace Dashboard')).toBeInTheDocument();
    });

    it('renders the Welcome back text', async () => {
      render(<Dashboard />);
      expect(await screen.findByText(/Welcome back, Manager/i)).toBeInTheDocument();
    });

    it('renders the time-range dropdown with all 4 options', async () => {
      render(<Dashboard />);
      const select = await screen.findByRole('combobox');
      const options = within(select).getAllByRole('option');
      const optionTexts = options.map(o => o.textContent);
      expect(optionTexts).toContain('Today');
      expect(optionTexts).toContain('Yesterday');
      expect(optionTexts).toContain('This Week');
      expect(optionTexts).toContain('This Month');
    });

    it('renders the Download Report button', async () => {
      render(<Dashboard />);
      expect(await screen.findByText(/Download Report/i)).toBeInTheDocument();
    });

    it('renders the Employee Analytics Feed section', async () => {
      render(<Dashboard />);
      expect(await screen.findByText('Employee Analytics Feed')).toBeInTheDocument();
    });

    it('renders the Workload Analytics section', async () => {
      render(<Dashboard />);
      expect(await screen.findByText('Workload Analytics')).toBeInTheDocument();
    });

    it('renders metric cards: active %, total staff, department units', async () => {
      render(<Dashboard />);
      expect(await screen.findByText(/ratio of the/i)).toBeInTheDocument();
      expect(await screen.findByText(/Total Database Staff/i)).toBeInTheDocument();
      expect(await screen.findByText(/Department Units/i)).toBeInTheDocument();
    });
  });

  // ── 2. API DATA LOADING ───────────────────────────────────────────────────

  describe('API Data Loading', () => {
    it('displays employees fetched from API', async () => {
      const apiEmployees = [
        makeEmployee({ name: 'Alice Wonderland', employee_id: 'EMP-A01', department: 'Finance' }),
        makeEmployee({ name: 'Bob Builder', employee_id: 'EMP-B02', department: 'Operations' }),
      ];
      getEmployees.mockResolvedValue({ success: true, employees: apiEmployees });

      render(<Dashboard />);
      expect(await screen.findByText('Alice Wonderland')).toBeInTheDocument();
      expect(await screen.findByText('Bob Builder')).toBeInTheDocument();
    });

    it('uses fallback data when API fails', async () => {
      getEmployees.mockRejectedValue(new Error('Network error'));
      render(<Dashboard />);
      // FALLBACK_EMPLOYEES contains 'Poovaran Sambath'
      expect(await screen.findByText('Poovaran Sambath')).toBeInTheDocument();
    });

    it('uses fallback data when API returns empty array', async () => {
      getEmployees.mockResolvedValue({ success: true, employees: [] });
      render(<Dashboard />);
      expect(await screen.findByText('Poovaran Sambath')).toBeInTheDocument();
    });
  });

  // ── 3. SEARCH FUNCTIONALITY ───────────────────────────────────────────────

  describe('Search Functionality', () => {
    beforeEach(() => {
      getEmployees.mockResolvedValue({
        success: true,
        employees: [
          makeEmployee({ name: 'John Smith', department: 'Engineering', designation: 'Backend Developer' }),
          makeEmployee({ name: 'Maria Garcia', department: 'Finance', designation: 'Accountant' }),
          makeEmployee({ name: 'Ahmed Hassan', department: 'HR', designation: 'Recruiter' }),
          makeEmployee({ name: 'Lisa Wong', department: 'Engineering', designation: 'Frontend Developer' }),
        ]
      });
    });

    it('shows employees when search is empty', async () => {
      render(<Dashboard />);
      expect(await screen.findByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('Maria Garcia')).toBeInTheDocument();
    });

    it('filters employees by name', async () => {
      render(<Dashboard />);
      const searchInput = await screen.findByPlaceholderText(/Search/i);
      await userEvent.type(searchInput, 'Maria');
      expect(screen.getByText('Maria Garcia')).toBeInTheDocument();
      expect(screen.queryByText('John Smith')).not.toBeInTheDocument();
    });

    it('filters employees by department', async () => {
      render(<Dashboard />);
      const searchInput = await screen.findByPlaceholderText(/Search/i);
      await userEvent.type(searchInput, 'Finance');
      expect(screen.getByText('Maria Garcia')).toBeInTheDocument();
      expect(screen.queryByText('John Smith')).not.toBeInTheDocument();
    });

    it('filters employees by designation', async () => {
      render(<Dashboard />);
      const searchInput = await screen.findByPlaceholderText(/Search/i);
      await userEvent.type(searchInput, 'Recruiter');
      expect(screen.getByText('Ahmed Hassan')).toBeInTheDocument();
      expect(screen.queryByText('John Smith')).not.toBeInTheDocument();
    });

    it('shows no-result message when nothing matches', async () => {
      render(<Dashboard />);
      const searchInput = await screen.findByPlaceholderText(/Search/i);
      await userEvent.type(searchInput, 'XXXXNOTEXIST');
      expect(screen.getByText(/No matching personnel records found/i)).toBeInTheDocument();
    });

    it('updates header to show search result count', async () => {
      render(<Dashboard />);
      const searchInput = await screen.findByPlaceholderText(/Search/i);
      await userEvent.type(searchInput, 'Engineering');
      expect(screen.getByText(/Search Results/i)).toBeInTheDocument();
    });

    it('is case-insensitive', async () => {
      render(<Dashboard />);
      const searchInput = await screen.findByPlaceholderText(/Search/i);
      await userEvent.type(searchInput, 'john smith');
      expect(screen.getByText('John Smith')).toBeInTheDocument();
    });
  });

  // ── 4. TIME-RANGE FILTER ──────────────────────────────────────────────────

  describe('Time-Range Filter', () => {
    it('default time range is "This Week"', async () => {
      render(<Dashboard />);
      const select = await screen.findByRole('combobox');
      expect(select.value).toBe('This Week');
    });

    it('changes time range when dropdown is changed', async () => {
      render(<Dashboard />);
      const select = await screen.findByRole('combobox');
      fireEvent.change(select, { target: { value: 'Today' } });
      expect(select.value).toBe('Today');
    });

    it('shows matched label when records exist for Today', async () => {
      getEmployees.mockResolvedValue({
        success: true,
        employees: [makeEmployee({ createdAt: today() })],
      });
      render(<Dashboard />);
      const select = await screen.findByRole('combobox');
      fireEvent.change(select, { target: { value: 'Today' } });
      expect(await screen.findByText(/Today:.*matched/i)).toBeInTheDocument();
    });

    it('shows fallback warning when no records exist for Yesterday', async () => {
      getEmployees.mockResolvedValue({
        success: true,
        employees: [makeEmployee({ createdAt: today() })],
      });
      render(<Dashboard />);
      const select = await screen.findByRole('combobox');
      fireEvent.change(select, { target: { value: 'Yesterday' } });
      expect(await screen.findByText(/No new records for Yesterday/i)).toBeInTheDocument();
    });

    it('shows Yesterday employees when they exist', async () => {
      getEmployees.mockResolvedValue({
        success: true,
        employees: [
          makeEmployee({ name: 'Yesterday Emp', createdAt: yesterday() }),
          makeEmployee({ name: 'Today Emp', createdAt: today() }),
        ],
      });
      render(<Dashboard />);
      const select = await screen.findByRole('combobox');
      fireEvent.change(select, { target: { value: 'Yesterday' } });
      expect(await screen.findByText(/Yesterday:.*1 employee matched/i)).toBeInTheDocument();
    });

    it('falls back to all employees when This Month has no records', async () => {
      getEmployees.mockResolvedValue({
        success: true,
        employees: [makeEmployee({ createdAt: lastMonth() })],
      });
      render(<Dashboard />);
      const select = await screen.findByRole('combobox');
      fireEvent.change(select, { target: { value: 'This Month' } });
      expect(await screen.findByText(/No new records for This Month/i)).toBeInTheDocument();
    });
  });

  // ── 5. METRIC CARDS ───────────────────────────────────────────────────────

  describe('Metric Cards', () => {
    it('shows 0% active when all employees are On Leave', async () => {
      getEmployees.mockResolvedValue({
        success: true,
        employees: [
          makeEmployee({ status: 'On Leave', createdAt: today() }),
          makeEmployee({ status: 'On Leave', createdAt: today() }),
        ],
      });
      render(<Dashboard />);
      const select = await screen.findByRole('combobox');
      fireEvent.change(select, { target: { value: 'Today' } });
      expect(await screen.findByText('0%')).toBeInTheDocument();
    });

    it('shows 100% active when all employees are Active', async () => {
      getEmployees.mockResolvedValue({
        success: true,
        employees: [
          makeEmployee({ status: 'Active', createdAt: today() }),
          makeEmployee({ status: 'Active', createdAt: today() }),
        ],
      });
      render(<Dashboard />);
      const select = await screen.findByRole('combobox');
      fireEvent.change(select, { target: { value: 'Today' } });
      expect(await screen.findByText('100%')).toBeInTheDocument();
    });

    it('calculates correct active percentage (3 Active + 1 On Leave = 75%)', async () => {
      getEmployees.mockResolvedValue({
        success: true,
        employees: [
          makeEmployee({ status: 'Active', createdAt: today() }),
          makeEmployee({ status: 'Active', createdAt: today() }),
          makeEmployee({ status: 'Active', createdAt: today() }),
          makeEmployee({ status: 'On Leave', createdAt: today() }),
        ],
      });
      render(<Dashboard />);
      const select = await screen.findByRole('combobox');
      fireEvent.change(select, { target: { value: 'Today' } });
      await waitFor(() => {
        const els = screen.getAllByText('75%');
        expect(els.length).toBeGreaterThan(0);
      });
    });

    it('shows correct unique department count', async () => {
      getEmployees.mockResolvedValue({
        success: true,
        employees: [
          makeEmployee({ department: 'Engineering', createdAt: today() }),
          makeEmployee({ department: 'Finance', createdAt: today() }),
          makeEmployee({ department: 'Engineering', createdAt: today() }), // duplicate
        ],
      });
      render(<Dashboard />);
      const select = await screen.findByRole('combobox');
      fireEvent.change(select, { target: { value: 'Today' } });
      // 2 unique departments
      expect(await screen.findByText(/2 Groups/i)).toBeInTheDocument();
    });
  });

  // ── 6. SEE MORE / SEE LESS TOGGLE ─────────────────────────────────────────

  describe('See More / See Less Toggle', () => {
    beforeEach(() => {
      getEmployees.mockResolvedValue({
        success: true,
        employees: Array.from({ length: 6 }, (_, i) =>
          makeEmployee({ name: `Employee ${i + 1}`, employee_id: `EMP-00${i + 1}` })
        ),
      });
    });

    it('shows only 4 employees initially', async () => {
      render(<Dashboard />);
      await screen.findByText('Employee 1');
      expect(screen.queryByText('Employee 5')).not.toBeInTheDocument();
      expect(screen.queryByText('Employee 6')).not.toBeInTheDocument();
    });

    it('shows all employees after clicking See More', async () => {
      render(<Dashboard />);
      await screen.findByText('Employee 1');
      // Pick the first "See More →" which is the Analytics Feed toggle
      const seeMoreBtns = screen.getAllByText(/See More/i);
      fireEvent.click(seeMoreBtns[0]);
      expect(screen.getByText('Employee 5')).toBeInTheDocument();
      expect(screen.getByText('Employee 6')).toBeInTheDocument();
    });

    it('collapses back to 4 after clicking See Less', async () => {
      render(<Dashboard />);
      await screen.findByText('Employee 1');
      const seeMoreBtns = screen.getAllByText(/See More/i);
      fireEvent.click(seeMoreBtns[0]);
      expect(screen.getByText('Employee 5')).toBeInTheDocument();
      fireEvent.click(screen.getByText(/See Less/i));
      expect(screen.queryByText('Employee 5')).not.toBeInTheDocument();
    });
  });

  // ── 7. WORKLOAD ANALYTICS MODAL ───────────────────────────────────────────

  describe('Workload Analytics Modal', () => {
    it('modal is not visible by default', async () => {
      render(<Dashboard />);
      await screen.findByText('Workload Analytics');
      expect(screen.queryByText('Detailed Workload & Sprint Log')).not.toBeInTheDocument();
    });

    it('opens modal when the Workload See More is clicked', async () => {
      render(<Dashboard />);
      await screen.findByText('Workload Analytics');
      const seeMoreLinks = screen.getAllByText(/See More/i);
      fireEvent.click(seeMoreLinks[seeMoreLinks.length - 1]);
      expect(screen.getByText('Detailed Workload & Sprint Log')).toBeInTheDocument();
    });

    it('closes modal when X button is clicked', async () => {
      render(<Dashboard />);
      await screen.findByText('Workload Analytics');
      const seeMoreLinks = screen.getAllByText(/See More/i);
      fireEvent.click(seeMoreLinks[seeMoreLinks.length - 1]);
      fireEvent.click(screen.getByText('✕'));
      expect(screen.queryByText('Detailed Workload & Sprint Log')).not.toBeInTheDocument();
    });

    it('closes modal when Close Window button is clicked', async () => {
      render(<Dashboard />);
      await screen.findByText('Workload Analytics');
      const seeMoreLinks = screen.getAllByText(/See More/i);
      fireEvent.click(seeMoreLinks[seeMoreLinks.length - 1]);
      fireEvent.click(screen.getByText('Close Window'));
      expect(screen.queryByText('Detailed Workload & Sprint Log')).not.toBeInTheDocument();
    });
  });

  // ── 8. ALERT / NOTIFICATION BAR ───────────────────────────────────────────

  describe('Alert Notification Bar', () => {
    it('shows no alert bar by default', async () => {
      render(<Dashboard />);
      await screen.findByText('Your Workspace Dashboard');
      expect(screen.queryByText(/downloaded successfully/i)).not.toBeInTheDocument();
    });

    it('hides alert when X is clicked', async () => {
      global.URL.createObjectURL = vi.fn(() => 'blob:mock');
      global.URL.revokeObjectURL = vi.fn();

      render(<Dashboard />);
      await screen.findByText('Download Report');
      fireEvent.click(screen.getByText('Download Report'));

      const alert = await screen.findByText(/Employee Report downloaded successfully/i);
      expect(alert).toBeInTheDocument();

      const closeBtn = screen.getAllByText('✕')[0];
      fireEvent.click(closeBtn);
      expect(screen.queryByText(/downloaded successfully/i)).not.toBeInTheDocument();
    });
  });

  // ── 9. EDGE CASES ─────────────────────────────────────────────────────────

  describe('Edge Cases', () => {
    it('handles employees with missing fields gracefully', async () => {
      getEmployees.mockResolvedValue({
        success: true,
        employees: [{ _id: 'x1', name: 'Partial Employee' }],
      });
      render(<Dashboard />);
      expect(await screen.findByText('Partial Employee')).toBeInTheDocument();
    });

    it('shows "General" for employees with no department', async () => {
      getEmployees.mockResolvedValue({
        success: true,
        employees: [makeEmployee({ department: undefined, name: 'No Dept User' })],
      });
      render(<Dashboard />);
      await screen.findByText('No Dept User');
      expect(screen.getByText('General')).toBeInTheDocument();
    });

    it('shows "Staff" for employees with no designation', async () => {
      getEmployees.mockResolvedValue({
        success: true,
        employees: [makeEmployee({ designation: undefined, name: 'No Role User' })],
      });
      render(<Dashboard />);
      await screen.findByText('No Role User');
      expect(screen.getByText('Staff')).toBeInTheDocument();
    });

    it('treats employees with no status as Active', async () => {
      getEmployees.mockResolvedValue({
        success: true,
        employees: [
          makeEmployee({ status: undefined, createdAt: today() }),
          makeEmployee({ status: undefined, createdAt: today() }),
        ],
      });
      render(<Dashboard />);
      const select = await screen.findByRole('combobox');
      fireEvent.change(select, { target: { value: 'Today' } });
      expect(await screen.findByText('100%')).toBeInTheDocument();
    });
  });

});
