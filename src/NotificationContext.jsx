import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();
const STORAGE_KEY = 'safedrive_notifications';

export default function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const addNotification = (description) => {
    const newNotification = {
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      description: description.trim(),
      timestamp: Date.now(),
      closed: false
    };

    const updatedNotifications = [...notifications, newNotification];
    setNotifications(updatedNotifications);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotifications));
  };

  const closeNotification = (id) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === id ? { ...notification, closed: true } : notification
    );
    setNotifications(updatedNotifications);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotifications));
  };

  const getActiveNotifications = () => {
    return notifications.filter(notification => !notification.closed);
  };

  const value = {
    notifications,
    addNotification,
    closeNotification,
    getActiveNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
