import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, CheckCheck, Trash2, X, PlusCircle, 
  Edit3, Trash, LogIn, LogOut, UserCheck, Check, Clock 
} from 'lucide-react';
import { 
  getActivities, 
  markAllAsRead, 
  clearActivities, 
  markAsRead, 
  deleteActivity,
  cleanupExpiredActivities,
  AUTO_REMOVE_DELAY_MS
} from '../services/activityService';

export const ActivityNotification = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activities, setActivities] = useState([]);
  const dropdownRef = useRef(null);

  const loadData = () => {
    setActivities(getActivities());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('activity-updated', loadData);

    // Periodic cleanup every 3 seconds to auto-remove read notifications after 2 minutes
    const interval = setInterval(() => {
      cleanupExpiredActivities();
      loadData();
    }, 3000);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('activity-updated', loadData);
      document.removeEventListener('mousedown', handleClickOutside);
      clearInterval(interval);
    };
  }, []);

  const unreadCount = activities.filter(a => !a.isRead).length;

  // Handler to delete a specific individual message immediately
  const handleDeleteSingle = (id, e) => {
    e.stopPropagation();
    try {
      deleteActivity(id);
      setActivities(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to delete activity:', err);
    }
  };

  // Handler to toggle/mark read for a specific individual message
  // When marked as read, it will automatically be removed after 2 minutes
  const handleToggleReadSingle = (id, currentReadStatus, e) => {
    e.stopPropagation();
    try {
      markAsRead(id);
      loadData();
    } catch (err) {
      console.error('Failed to toggle read status:', err);
    }
  };

  const getIcon = (action) => {
    switch (action) {
      case 'CREATE': return <PlusCircle size={16} color="#10b981" />;
      case 'UPDATE': return <Edit3 size={16} color="#007bff" />;
      case 'DELETE': return <Trash size={16} color="#dc3545" />;
      case 'LOGIN': return <LogIn size={16} color="#0092acff" />;
      case 'LOGOUT': return <LogOut size={16} color="#6c757d" />;
      case 'PROFILE': return <UserCheck size={16} color="#8b5cf6" />;
      default: return <Bell size={16} color="#007bff" />;
    }
  };

  // Formats time strictly into Indian 12-Hour format (AM / PM, NO 24-hour railway time)
  const formatIndianTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    // Standard Indian 12-hour time format with AM/PM (e.g. "05:39 PM" or "11:25 AM")
    const time12Hour = date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).toUpperCase();

    if (diffSeconds < 45) {
      return 'Just now';
    }

    if (diffMinutes < 60) {
      return `${diffMinutes} min${diffMinutes > 1 ? 's' : ''} ago (${time12Hour})`;
    }

    if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago (${time12Hour})`;
    }

    // Full Indian date format (e.g. "11 Sep, 05:39 PM")
    const datePart = date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });

    return `${datePart}, ${time12Hour}`;
  };

  // Calculates remaining seconds until 2-minute auto-removal for read notifications
  const getAutoRemoveRemainingText = (item) => {
    if (!item.isRead || !item.readAt) return null;
    const elapsed = Date.now() - item.readAt;
    const remainingSecs = Math.max(0, Math.ceil((AUTO_REMOVE_DELAY_MS - elapsed) / 1000));
    const mins = Math.floor(remainingSecs / 60);
    const secs = remainingSecs % 60;
    return `Auto-removes in ${mins > 0 ? `${mins}m ` : ''}${secs}s`;
  };

  return (
    <div style={styles.wrapper} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        style={styles.iconButton} 
        aria-label="Notifications"
        title="View activity notifications"
      >
        <Bell size={20} color="#111111" />
        {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
      </button>

      {isOpen && (
        <div style={styles.dropdown}>
          <div style={styles.dropdownHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={styles.dropdownTitle}>Notifications</h3>
              {unreadCount > 0 && (
                <span style={styles.unreadPill}>{unreadCount} new</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {activities.length > 0 && (
                <button 
                  onClick={markAllAsRead} 
                  style={styles.headerActionBtn} 
                  title="Mark all as read (Auto-removes in 2 mins)"
                >
                  <CheckCheck size={16} />
                </button>
              )}
              {activities.length > 0 && (
                <button 
                  onClick={clearActivities} 
                  style={styles.headerActionBtn} 
                  title="Clear all notifications"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)} 
                style={styles.headerActionBtn} 
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div style={styles.activityList}>
            {activities.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={{ fontWeight: '700', fontSize: '14px', margin: '0 0 4px 0', color: '#111111' }}>
                  All caught up! 🎉
                </p>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                  No recent activity or notifications.
                </p>
              </div>
            ) : (
              activities.map((item) => {
                const autoRemoveText = getAutoRemoveRemainingText(item);
                return (
                  <div 
                    key={item.id} 
                    style={{ 
                      ...styles.activityItem, 
                      backgroundColor: item.isRead ? '#ffffff' : '#f0fdf4',
                      borderLeft: item.isRead ? '3px solid transparent' : '3px solid #10b981'
                    }}
                  >
                    <div style={styles.iconBox}>
                      {getIcon(item.action)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={styles.itemTitle}>{item.title}</div>
                        {item.isRead && (
                          <span style={styles.readBadge} title="Notification marked as read">
                            Read
                          </span>
                        )}
                      </div>
                      <div style={styles.itemMessage}>{item.message}</div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
                        <div style={styles.itemTime}>
                          <Clock size={11} style={{ marginRight: '4px' }} />
                          {formatIndianTime(item.createdAt)}
                        </div>

                        {/* 2-Minute Auto-removal Indicator */}
                        {item.isRead && autoRemoveText && (
                          <span style={styles.autoRemoveTag} title="This message will disappear automatically 2 minutes after being marked as read">
                            ⏱️ {autoRemoveText}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons: Tick (Mark Read) & Trash (Delete) */}
                    <div style={styles.itemActionButtons}>
                      <button 
                        onClick={(e) => handleToggleReadSingle(item.id, item.isRead, e)}
                        style={{
                          ...styles.actionIconButton,
                          backgroundColor: item.isRead ? '#10b981' : '#f1f5f9',
                          borderColor: item.isRead ? '#10b981' : '#cbd5e1',
                          color: item.isRead ? '#ffffff' : '#475569'
                        }} 
                        title={item.isRead ? "Marked read (Auto-removes in 2 mins). Click to unmark." : "Mark as read (Auto-removes in 2 mins)"}
                      >
                        <Check size={14} strokeWidth={item.isRead ? 3 : 2} />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteSingle(item.id, e)}
                        style={styles.deleteIconButton} 
                        title="Delete this notification now"
                      >
                        <Trash2 size={14} color="#dc2626" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    position: 'relative',
    display: 'inline-block',
  },
  iconButton: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    position: 'relative',
    padding: '9px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    fontSize: '10.5px',
    fontWeight: '800',
    padding: '2px 6px',
    borderRadius: '9999px',
    minWidth: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(220, 38, 38, 0.4)',
    border: '2px solid #ffffff',
  },
  unreadPill: {
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: '#dcfce7',
    color: '#16a34a',
    padding: '2px 7px',
    borderRadius: '9999px',
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: '48px',
    width: '380px',
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    boxShadow: '0 14px 36px rgba(0,0,0,0.18)',
    border: '1px solid #e2e8f0',
    zIndex: 1000,
    overflow: 'hidden',
    fontFamily: 'inherit',
    animation: 'fadeIn 0.2s ease-out',
  },
  dropdownHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 18px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  dropdownTitle: {
    fontSize: '15px',
    fontWeight: '800',
    margin: 0,
    color: '#0f172a',
    letterSpacing: '-0.3px',
  },
  headerActionBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    padding: '5px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s',
  },
  activityList: {
    maxHeight: '400px',
    overflowY: 'auto',
  },
  emptyState: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#475569',
  },
  activityItem: {
    display: 'flex',
    gap: '12px',
    padding: '14px 16px',
    borderBottom: '1px solid #f1f5f9',
    alignItems: 'flex-start',
    position: 'relative',
    transition: 'background 0.2s',
  },
  iconBox: {
    marginTop: '2px',
    flexShrink: 0,
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#0f172a',
  },
  readBadge: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#10b981',
    backgroundColor: '#ecfdf5',
    padding: '1px 6px',
    borderRadius: '4px',
  },
  itemMessage: {
    fontSize: '12.5px',
    color: '#475569',
    margin: '3px 0 0 0',
    wordBreak: 'break-word',
    lineHeight: '1.4',
  },
  itemTime: {
    fontSize: '11px',
    color: '#64748b',
    display: 'inline-flex',
    alignItems: 'center',
    fontWeight: '500',
  },
  autoRemoveTag: {
    fontSize: '10.5px',
    color: '#d97706',
    backgroundColor: '#fef3c7',
    padding: '1px 6px',
    borderRadius: '4px',
    fontWeight: '600',
  },
  itemActionButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    justifyContent: 'center',
    marginLeft: '6px',
    flexShrink: 0,
  },
  actionIconButton: {
    border: '1px solid',
    borderRadius: '6px',
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  deleteIconButton: {
    background: '#ffffff',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
};

export default ActivityNotification;