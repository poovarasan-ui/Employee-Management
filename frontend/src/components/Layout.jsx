import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import LogoutConfirmModal from './LogoutConfirmModal';
import { useLanguage } from '../context/LanguageContext'; // ⚠️ Adjust path if your context folder is elsewhere

const Layout = () => {
  const { t } = useLanguage(); // Grab global translations
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({
        type: 'error',
        text: 'Please select an image file.'
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage({
        type: 'error',
        text: 'Image size must be less than 2MB.'
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = reader.result;

      setProfileImage(image);

      const updatedUser = {
        ...user,
        profileImage: image
      };

      setUser(updatedUser);

      localStorage.setItem(
        'user',
        JSON.stringify(updatedUser)
      );

      window.dispatchEvent(new Event('user-updated'));

      setMessage({
        type: 'success',
        text: 'Profile picture updated successfully.'
      });
    };

    reader.readAsDataURL(file);
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
    return t.dashboard || 'Employee Dashboard';
  };

  return (
    <div className="app-layout">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
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