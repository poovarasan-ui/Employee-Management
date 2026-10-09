import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, Edit, Trash2, Scan, Clock, Settings, LogOut, Menu, Shield, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext'; 
import { getCurrentUser, isEmployee } from '../utils/auth';

const Sidebar = ({ isOpen, isCollapsed, toggleSidebar, toggleCollapsed, onLogout }) => {
  const { t } = useLanguage(); 
  const location = useLocation();
  const currentUser = getCurrentUser();
  const userIsEmp = isEmployee();

  const isActive = (path) => location.pathname.toLowerCase() === path.toLowerCase();

  const allNavLinks = [
    { to: '/dashboard',         icon: <LayoutDashboard size={20} />, label: userIsEmp ? 'My Portal' : (t.dashboard || 'Dashboard') },
    { to: '/employees',         icon: <Users size={20} />,           label: 'Read Employees', adminOnly: true },
    { to: '/employees/add',     icon: <UserPlus size={20} />,        label: 'Add Employee', adminOnly: true },
    { to: '/employees/update',  icon: <Edit size={20} />,            label: 'Update Records', adminOnly: true },
    { to: '/employees/delete',  icon: <Trash2 size={20} />,          label: 'Delete Records', adminOnly: true },
    { to: '/attendance',        icon: <Clock size={20} />,           label: userIsEmp ? 'Punch Clock & Leaves' : 'Attendance & Leaves' },
    { to: '/scandata',          icon: <Scan size={20} />,            label: 'Scan Records', adminOnly: true },
    { to: '/settings',          icon: <Settings size={20} />,        label: t.settings || 'Settings' },
  ];

  const navLinks = userIsEmp 
    ? allNavLinks.filter(item => !item.adminOnly) 
    : allNavLinks;

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Header: brand + hamburger */}
      <div className="sidebar-header">
        {!isCollapsed && (
          <div>
            <h2 className="sidebar-brand">{userIsEmp ? 'Employee' : 'Admin'} Portal</h2>
            <span style={{ 
              fontSize: '10px', 
              textTransform: 'uppercase', 
              letterSpacing: '0.08em', 
              background: userIsEmp ? 'rgba(6, 182, 212, 0.2)' : 'rgba(16, 185, 129, 0.2)', 
              color: userIsEmp ? '#06b6d4' : '#10b981', 
              padding: '2px 6px', 
              borderRadius: '4px',
              fontWeight: 700 
            }}>
              {userIsEmp ? 'Employee Access' : 'HR / Admin Access'}
            </span>
          </div>
        )}
        <button
          className="sidebar-hamburger"
          onClick={toggleCollapsed}
          aria-label="Toggle sidebar"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Nav links */}
      <div className="sidebar-menu">
        {navLinks.map(({ to, icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`sidebar-link ${isActive(to) ? 'active' : ''}`}
            onClick={toggleSidebar}
            title={isCollapsed ? label : undefined}
          >
            <span className="sidebar-link-icon">{icon}</span>
            {!isCollapsed && <span className="sidebar-link-label">{label}</span>}
          </Link>
        ))}
      </div>

      {/* Footer: logout */}
      <div className="sidebar-footer">
        <button
          onClick={onLogout}
          className="logout-btn"
          title={isCollapsed ? (t.logout || 'Logout') : undefined}
        >
          <span className="sidebar-link-icon"><LogOut size={20} /></span>
          {!isCollapsed && <span>{t.logout || 'Logout'}</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;