const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  type: {
    type: String,
    enum: ['apartment', 'house', 'condo', 'studio', 'townhouse'],
    required: true
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  price: {
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    period: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' }
  },
  features: {
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    area: { type: Number, required: true }, // in square feet/meters
    parking: { type: Boolean, default: false },
    furnished: { type: Boolean, default: false },
    petsAllowed: { type: Boolean, default: false }
  },
  amenities: [{
    type: String
  }],
  images: [{
    url: { type: String, required: true },
    isMain: { type: Boolean, default: false }
  }],
  status: {
    type: String,
    enum: ['available', 'rented', 'unavailable'],
    default: 'available'
  },
  currentTenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lease: {
    startDate: Date,
    endDate: Date,
    terms: String
  },
  documents: [{
    type: { type: String, required: true },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    createdAt: { type: Date, default: Date.now }
  }],
  averageRating: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate average rating before saving
propertySchema.pre('save', function(next) {
  if (this.ratings.length > 0) {
    this.averageRating = this.ratings.reduce((acc, item) => acc + item.rating, 0) / this.ratings.length;
  }
  next();
});

// Add indexes for better query performance
propertySchema.index({ 'address.city': 1, 'address.state': 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ owner: 1 });

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
