const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    genre: {
      type: String,
      default: 'Action',
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      default: 'English',
    },
    duration: {
      type: String,
      default: '2h 30m',
    },
    rating: {
      type: Number,
      default: 7.5,
      min: 0,
      max: 10,
    },
    showTime: {
      type: String,
      required: [true, 'Show time is required'],
    },
    showDates: {
      type: [String],
      default: [],
    },
    availableSeats: {
      type: Number,
      required: [true, 'Available seats is required'],
      min: 0,
    },
    totalSeats: {
      type: Number,
      default: 100,
    },
    price: {
      type: Number,
      default: 250,
    },
    poster: {
      type: String,
      default: '',
    },
    cast: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Movie', movieSchema);
