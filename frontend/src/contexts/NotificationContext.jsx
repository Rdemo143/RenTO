import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { initializeNotifications, setupNotificationListener } from '../services/notificationService';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Initialize notifications when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      initializeNotifications()
        .then(token => {
          if (token) {
            console.log('Notifications initialized with token:', token);
          }
        })
        .catch(err => console.error('Error initializing notifications:', err));
    }
  }, [isAuthenticated]);
  
  // Set up notification listener
  useEffect(() => {
    if (isAuthenticated) {
      setupNotificationListener((payload) => {
        // Add notification to state
        const newNotification = {
          id: Date.now(),
          title: payload.notification?.title || 'New Notification',
          body: payload.notification?.body || '',
          data: payload.data || {},
          read: false,
          timestamp: new Date().toISOString()
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
    }
  }, [isAuthenticated]);
  
  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      )
    );
    
    // Update unread count
    const updatedUnreadCount = notifications.filter(n => !n.read).length;
    setUnreadCount(updatedUnreadCount);
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };
  
  // Remove a notification
  const removeNotification = (notificationId) => {
    const notification = notifications.find(n => n.id === notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    
    // Update unread count if the removed notification was unread
    if (notification && !notification.read) {
      setUnreadCount(prev => prev - 1);
    }
  };
  
  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };
  
  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
