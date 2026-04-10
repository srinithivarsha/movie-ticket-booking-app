const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  cancelBooking,
  getStats,
  getOccupiedSeats,
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/occupied', protect, getOccupiedSeats);
router.put('/:id/cancel', protect, cancelBooking);

// Admin
router.get('/all', protect, adminOnly, getAllBookings);
router.get('/stats', protect, adminOnly, getStats);

module.exports = router;
