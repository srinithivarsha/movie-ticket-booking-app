const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    seats: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Card', 'NetBanking', 'Wallet', 'Cash'],
      default: 'UPI',
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'success',
    },
    transactionId: {
      type: String,
      unique: true,
      index: true,
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

paymentSchema.pre('save', function (next) {
  if (!this.transactionId) {
    this.transactionId =
      'PAY' +
      Date.now().toString(36).toUpperCase() +
      Math.random().toString(36).slice(2, 6).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
