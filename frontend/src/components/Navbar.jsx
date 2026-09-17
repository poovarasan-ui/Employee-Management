import React from 'react';
import { Menu } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext'; // ⚠️ Adjust path if your context folder is in a different location
import { ActivityNotification } from './ActivityNotification'; // Added import for notification box

const Navbar = ({ toggleSidebar, title = 'Dashboard' }) => {
  const { language } = useLanguage(); // Access global language state if needed for date locale

  // Formats the date dynamically based on the current active language
  const localeMap = {
    Tamil: 'ta-IN',
    Spanish: 'es-ES',
    English: 'en-US'
  };

  const currentDate = new Date().toLocaleDateString(localeMap[language] || 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle-btn" onClick={toggleSidebar} aria-label="Toggle Menu">
          <Menu size={22} />
        </button>
        <div className="page-header-text">
          <h1>{title}</h1>
          <span className="navbar-date">{currentDate}</span>
        </div>
      </div>

      {/* Added Activity Notification Box on the right side of the navbar */}
      <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ActivityNotification />
      </div>
    </header>
  );
};

export default Navbar;