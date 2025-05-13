const admin = require('firebase-admin');
const User = require('../models/User');

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Send notification to a specific user
exports.sendNotification = async ({ userId, title, body, data = {} }) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.fcmToken) {
      return;
    }

    const message = {
      notification: {
        title,
        body
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      },
      token: user.fcmToken
    };

    const response = await admin.messaging().send(message);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

// Send notification to multiple users
exports.sendBulkNotifications = async (users, { title, body, data = {} }) => {
  try {
    const tokens = users.map(user => user.fcmToken).filter(Boolean);
    if (tokens.length === 0) return;

    const message = {
      notification: {
        title,
        body
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      },
      tokens
    };

    const response = await admin.messaging().sendMulticast(message);
    return response;
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    throw error;
  }
};

// Update user's FCM token
exports.updateFCMToken = async (userId, token) => {
  try {
    await User.findByIdAndUpdate(userId, { fcmToken: token });
  } catch (error) {
    console.error('Error updating FCM token:', error);
    throw error;
  }
}; 