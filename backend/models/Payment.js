const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lease: { type: mongoose.Schema.Types.ObjectId, ref: 'Lease', required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['card', 'bank', 'cash'], default: 'card' },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  transactionId: { type: String },
  paidAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
