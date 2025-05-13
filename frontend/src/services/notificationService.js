import { requestNotificationPermission, onMessageListener } from '../config/firebase';
import { updateFCMToken } from './api';

// Initialize notifications when user logs in
export const initializeNotifications = async () => {
  try {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return null;
    }
    
    // Skip if notifications are already denied
    if (Notification.permission === 'denied') {
      console.log('Notifications are blocked by the user');
      return null;
    }
    
    // Request permission and get token
    const token = await requestNotificationPermission();
    if (token) {
      try {
        // Save the token to the user's profile in the backend
        await updateFCMToken(token);
        console.log('FCM token saved to user profile');
      } catch (updateError) {
        console.error('Error saving FCM token to backend:', updateError);
        // Continue even if backend save fails
      }
    } else {
      console.log('No FCM token was obtained');
    }
    return token;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    // Don't stop the app flow if notifications fail
    return null;
  }
};

// Set up notification listener for foreground messages
export const setupNotificationListener = (callback) => {
  try {
    onMessageListener()
      .then((payload) => {
        if (!payload) {
          console.log('No payload received or messaging not supported');
          return;
        }
        
        const { notification } = payload;
        // Display notification using browser notification API
        if (notification) {
          const { title, body } = notification;
          displayNotification(title, body, payload.data);
        }
        // Call the callback function with the payload
        if (callback && typeof callback === 'function') {
          callback(payload);
        }
      })
      .catch((err) => console.error('Error setting up notification listener:', err));
  } catch (error) {
    console.error('Failed to setup notification listener:', error);
  }
};

// Display browser notification
export const displayNotification = (title, body, data = {}) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const options = {
        body,
        icon: '/logo192.png', // Path to your notification icon
        data
      };
      
      const notification = new Notification(title, options);
      
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        
        // Handle notification click based on data
        if (data.type === 'chat') {
          window.location.href = `/messages?conversationId=${data.conversationId}`;
        } else if (data.type === 'maintenance') {
          window.location.href = `/maintenance/${data.requestId}`;
        } else if (data.type === 'payment') {
          window.location.href = `/payments/${data.paymentId}`;
        } else if (data.type === 'property') {
          window.location.href = `/properties/${data.propertyId}`;
        } else {
          // Default action
          window.location.href = '/dashboard';
        }
        
        notification.close();
      };
    } catch (error) {
      console.error('Error displaying notification:', error);
    }
  }
};
