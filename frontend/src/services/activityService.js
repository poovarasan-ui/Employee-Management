// Activity Notification Service
// Handles logging, read tracking, Indian 12-hour time formatting, and 2-minute auto-removal of read notifications

export const AUTO_REMOVE_DELAY_MS = 2 * 60 * 1000; // 2 minutes (120,000 ms)

// Clean and fetch activities from localStorage, filtering out read items older than 2 minutes
export const getActivities = () => {
  try {
    const data = localStorage.getItem('app_activities');
    if (!data) return [];
    
    const activities = JSON.parse(data);
    const now = Date.now();

    // Filter out read notifications that exceeded the 2-minute auto-removal delay
    const filtered = activities.filter((item) => {
      if (item.isRead && item.readAt) {
        return (now - item.readAt) < AUTO_REMOVE_DELAY_MS;
      }
      return true;
    });

    // If any items were removed due to the 2-minute timer, update localStorage
    if (filtered.length !== activities.length) {
      localStorage.setItem('app_activities', JSON.stringify(filtered));
    }

    return filtered;
  } catch (err) {
    console.error('Failed to load activities', err);
    return [];
  }
};

// Periodic cleanup of expired read activities
export const cleanupExpiredActivities = () => {
  try {
    const data = localStorage.getItem('app_activities');
    if (!data) return [];
    
    const activities = JSON.parse(data);
    const now = Date.now();

    const filtered = activities.filter((item) => {
      if (item.isRead && item.readAt) {
        return (now - item.readAt) < AUTO_REMOVE_DELAY_MS;
      }
      return true;
    });

    if (filtered.length !== activities.length) {
      localStorage.setItem('app_activities', JSON.stringify(filtered));
      window.dispatchEvent(new Event('activity-updated'));
    }

    return filtered;
  } catch (err) {
    console.error('Failed to cleanup activities', err);
    return [];
  }
};

// Log a new notification activity
export const logActivity = (action, title, message) => {
  try {
    const activities = getActivities();
    const newActivity = {
      id: Date.now().toString(),
      action, // 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PROFILE'
      title,
      message,
      createdAt: new Date().toISOString(),
      isRead: false,
      readAt: null,
    };
    
    const updated = [newActivity, ...activities];
    localStorage.setItem('app_activities', JSON.stringify(updated));
    window.dispatchEvent(new Event('activity-updated'));
  } catch (err) {
    console.error('Failed to log activity', err);
  }
};

// Mark all notifications as read and schedule 2-minute auto-removal
export const markAllAsRead = () => {
  try {
    const activities = getActivities();
    const now = Date.now();
    const updated = activities.map((item) => ({ 
      ...item, 
      isRead: true,
      readAt: item.readAt || now
    }));
    localStorage.setItem('app_activities', JSON.stringify(updated));
    window.dispatchEvent(new Event('activity-updated'));
  } catch (err) {
    console.error('Failed to mark activities as read', err);
  }
};

// Mark a single specific activity as read/unread by its ID
// When marked as read (tick clicked), records readAt timestamp for 2-minute auto-deletion
export const markAsRead = (id) => {
  try {
    const activities = getActivities();
    const now = Date.now();
    const updated = activities.map((item) => {
      if (item.id === id) {
        const nextIsRead = !item.isRead;
        return {
          ...item,
          isRead: nextIsRead,
          readAt: nextIsRead ? now : null
        };
      }
      return item;
    });
    localStorage.setItem('app_activities', JSON.stringify(updated));
    window.dispatchEvent(new Event('activity-updated'));
  } catch (err) {
    console.error('Failed to update activity read status', err);
  }
};

// Delete a single specific activity immediately by ID
export const deleteActivity = (id) => {
  try {
    const activities = getActivities();
    const updated = activities.filter((item) => item.id !== id);
    localStorage.setItem('app_activities', JSON.stringify(updated));
    window.dispatchEvent(new Event('activity-updated'));
  } catch (err) {
    console.error('Failed to delete activity', err);
  }
};

// Clear all activities
export const clearActivities = () => {
  try {
    localStorage.removeItem('app_activities');
    window.dispatchEvent(new Event('activity-updated'));
  } catch (err) {
    console.error('Failed to clear activities', err);
  }
};