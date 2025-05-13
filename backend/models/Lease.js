const mongoose = require('mongoose');

const leaseSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  rentAmount: { type: Number, required: true },
  signed: { type: Boolean, default: false },
  contractUrl: { type: String }, // For storing e-signed contract PDF link
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lease', leaseSchema);
