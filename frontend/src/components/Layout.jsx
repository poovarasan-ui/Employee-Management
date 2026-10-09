import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import LogoutConfirmModal from './LogoutConfirmModal';
import { useLanguage } from '../context/LanguageContext';

const Layout = () => {
  const { t } = useLanguage(); // Grab global translations
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleCollapsed = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Dynamic Page Titles linked to your Language Context
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return t.dashboard || 'Dashboard Overview';
    if (path === '/employees') return 'Read Employees (Directory)';
    if (path.startsWith('/employees/view')) return 'Employee Full Details (READ)';
    if (path === '/employees/add') return 'Create Employee (Add Record)';
    if (path === '/employees/update') return 'Update Employee Records';
    if (path === '/employees/delete') return 'Delete Employee Records';
    if (path === '/settings') return t.settings || 'Settings';
    if (path.startsWith('/employees/edit')) return 'Edit Employee Profile';
    if (path === '/scandata') return 'Scan Records';
    return t.dashboard || 'Employee Dashboard';
  };

  return (
    <div className={`app-layout ${sidebarOpen ? 'sidebar-is-open' : ''} ${sidebarCollapsed ? 'sidebar-is-collapsed' : ''}`}>
      {/* Mobile Backdrop Overlay: Tapping outside the sidebar closes it */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        toggleCollapsed={toggleCollapsed}
        onLogout={() => setShowLogoutConfirm(true)}
      />
      
      <div className="main-wrapper">
        <Navbar
          toggleSidebar={toggleSidebar}
          title={getPageTitle()}
        />
        <main className="main-content">
          <Outlet />
        </main>
      </div>

      {showLogoutConfirm && (
        <LogoutConfirmModal
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={handleLogout}
        />
      )}
    </div>
  );
};

export default Layout;