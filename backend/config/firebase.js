// config/firebase.js
const admin = require('firebase-admin');
const path = require('path');

// Path to your Firebase service account key JSON file
const serviceAccount = require(path.join(__dirname, '../firebase-service-account.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://rento-906b0-default-rtdb.firebaseio.com/',
});

module.exports = admin;
