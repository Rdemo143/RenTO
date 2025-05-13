const admin = require('../config/firebase');

exports.sendNotification = async (token, title, body, data = {}) => {
  try {
    const message = {
      notification: { title, body },
      data,
      token,
    };

    const response = await admin.messaging().send(message);
    console.log('Notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};
