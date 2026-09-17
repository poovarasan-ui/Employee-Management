import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, Edit, Trash2, Settings, LogOut } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext'; 

const Sidebar = ({ isOpen, toggleSidebar, onLogout }) => {
  const { t } = useLanguage(); 
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>{t.dashboard || "Dashboard"}</h2>
      </div>

      <div className="sidebar-menu">
        <Link 
          to="/dashboard" 
          className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>{t.dashboard || "Dashboard"}</span>
        </Link>

        {/* Read Employees */}
        <Link 
          to="/employees" 
          className={`sidebar-link ${isActive('/employees') ? 'active' : ''}`}
        >
          <Users size={20} />
          <span>Read Employees</span>
        </Link>

        {/* Add Employee (Create) */}
        <Link 
          to="/employees/add" 
          className={`sidebar-link ${isActive('/employees/add') ? 'active' : ''}`}
        >
          <UserPlus size={20} />
          <span>Add Employee</span>
        </Link>

        {/* Update Records */}
        <Link 
          to="/employees/update" 
          className={`sidebar-link ${isActive('/employees/update') ? 'active' : ''}`}
        >
          <Edit size={20} />
          <span>Update Records</span>
        </Link>

        {/* Delete Records */}
        <Link 
          to="/employees/delete" 
          className={`sidebar-link ${isActive('/employees/delete') ? 'active' : ''}`}
        >
          <Trash2 size={20} />
          <span>Delete Records</span>
        </Link>
        <Link to="/ScanData"
        className={`sidebar-link ${isActive('/scandata') ? 'active' : ''}`}
        >
          <Trash2 size={20} />
          <span>Scan Records</span>

        </Link>
        <Link 
          to="/settings" 
          className={`sidebar-link ${isActive('/settings') ? 'active' : ''}`}
        >
          <Settings size={20} />
          <span>{t.settings || "Settings"}</span>
        </Link>
      </div>

      <div className="sidebar-footer">
        <button onClick={onLogout} className="logout-btn">
          <LogOut size={20} />
          <span>{t.logout || "Logout"}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;