const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
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
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
    seatsBooked: {
      type: Number,
      required: [true, 'Seats booked is required'],
      min: 1,
      max: 10,
    },
    selectedSeats: {
      type: [Number],
      default: [],
      validate: {
        validator: function (seats) {
          if (!Array.isArray(seats)) return false;
          if (seats.length > 10) return false;
          const uniqueSeats = new Set(seats);
          if (uniqueSeats.size !== seats.length) return false;
          return seats.every((seat) => Number.isInteger(seat) && seat > 0);
        },
        message: 'Selected seats must be unique seat numbers (max 10)',
      },
    },
    showDate: {
      type: String,
      required: true,
    },
    showTime: {
      type: String,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Card', 'NetBanking', 'Wallet', 'Cash'],
      default: 'UPI',
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
    bookingId: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Generate booking ID before saving
bookingSchema.pre('save', function (next) {
  if (!this.bookingId) {
    this.bookingId =
      'BMS' +
      Date.now().toString(36).toUpperCase() +
      Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
