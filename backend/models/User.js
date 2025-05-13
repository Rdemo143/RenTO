const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['tenant', 'owner', 'admin'],
    default: 'tenant'
  },
  phone: {
    type: String
  },
  profilePicture: {
    type: String
  },
  fcmToken: {
    type: String
  },
  notificationSettings: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    documentUpdates: { type: Boolean, default: true },
    chatMessages: { type: Boolean, default: true },
    paymentReminders: { type: Boolean, default: true }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    theme: { type: String, default: 'light' }
  }
}, {
  timestamps: true
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if user has a specific role
userSchema.methods.hasRole = function(role) {
  return this.role === role;
};

// Check if user has any of the specified roles
userSchema.methods.hasAnyRole = function(roles) {
  return roles.includes(this.role);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
