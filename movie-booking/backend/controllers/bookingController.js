const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const Payment = require('../models/Payment');

const getBookedSeatsForShow = async (movieId, showDate, showTime) => {
  const bookings = await Booking.find({
    movieId,
    showDate,
    showTime,
    status: 'confirmed',
  }).select('selectedSeats');

  const bookedSeatSet = new Set();
  bookings.forEach((booking) => {
    (booking.selectedSeats || []).forEach((seat) => bookedSeatSet.add(seat));
  });

  return Array.from(bookedSeatSet).sort((a, b) => a - b);
};

const getWatchStatus = (booking) => {
  if (booking.status === 'cancelled') return 'cancelled';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const showDate = new Date(`${booking.showDate}T00:00:00`);

  return showDate < today ? 'watched' : 'going_to_watch';
};

// @POST /api/bookings
const createBooking = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authorized, please login again' });
    }

    const { movieId, seatsBooked, selectedSeats = [], showDate, showTime, paymentMethod, paymentId } =
      req.body;

    if (!movieId || !showDate || !showTime) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const normalizedSelectedSeats = Array.isArray(selectedSeats)
      ? selectedSeats
          .map((seat) => Number(seat))
          .filter((seat) => Number.isInteger(seat) && seat > 0)
      : [];
    const hasManualSeatSelection = normalizedSelectedSeats.length > 0;
    const finalSeatsBooked = hasManualSeatSelection
      ? normalizedSelectedSeats.length
      : Number(seatsBooked);

    if (!Number.isInteger(finalSeatsBooked) || finalSeatsBooked < 1 || finalSeatsBooked > 10) {
      return res.status(400).json({ message: 'You can book between 1 and 10 seats' });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    if (hasManualSeatSelection) {
      const uniqueSeats = new Set(normalizedSelectedSeats);
      if (uniqueSeats.size !== normalizedSelectedSeats.length) {
        return res.status(400).json({ message: 'Duplicate seat numbers are not allowed' });
      }

      const invalidSeat = normalizedSelectedSeats.find(
        (seat) => !Number.isInteger(seat) || seat < 1 || seat > movie.totalSeats
      );
      if (invalidSeat) {
        return res
          .status(400)
          .json({ message: `Seat ${invalidSeat} is invalid for this theater` });
      }
    }

    const bookedSeats = await getBookedSeatsForShow(movieId, showDate, showTime);
    const remainingSeatsByShow = movie.totalSeats - bookedSeats.length;
    if (remainingSeatsByShow < finalSeatsBooked) {
      return res.status(400).json({
        message: `Only ${Math.max(remainingSeatsByShow, 0)} seats available for this show`,
      });
    }

    if (movie.availableSeats < finalSeatsBooked) {
      return res.status(400).json({
        message: `Only ${movie.availableSeats} seats available`,
      });
    }

    if (hasManualSeatSelection) {
      const conflictSeat = normalizedSelectedSeats.find((seat) => bookedSeats.includes(seat));
      if (conflictSeat) {
        return res.status(400).json({
          message: `Seat ${conflictSeat} is already booked. Please choose another seat.`,
        });
      }
    }

    const paymentMethodMap = {
      upi: 'UPI',
      card: 'Card',
      netbanking: 'NetBanking',
      net_banking: 'NetBanking',
      wallet: 'Wallet',
      cash: 'Cash',
      defaultpay: 'UPI',
      default_pay: 'UPI',
      'default pay': 'UPI',
    };
    const normalizedPaymentMethod =
      paymentMethodMap[String(paymentMethod || '').trim().toLowerCase()] || 'UPI';

    const totalPrice = finalSeatsBooked * movie.price;
    let resolvedPaymentId = null;
    let resolvedPaymentMethod = normalizedPaymentMethod;

    if (paymentId) {
      const payment = await Payment.findById(paymentId);
      if (!payment) return res.status(404).json({ message: 'Payment not found' });
      if (payment.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Payment does not belong to current user' });
      }
      if (payment.movieId.toString() !== movieId) {
        return res.status(400).json({ message: 'Payment movie mismatch' });
      }
      if (payment.status !== 'success') {
        return res.status(400).json({ message: 'Payment is not successful' });
      }
      if (payment.amount !== totalPrice) {
        return res.status(400).json({ message: 'Payment amount mismatch' });
      }
      if (payment.seats !== finalSeatsBooked) {
        return res.status(400).json({ message: 'Payment seat count mismatch' });
      }

      resolvedPaymentId = payment._id;
      resolvedPaymentMethod = payment.paymentMethod;
    }

    const booking = await Booking.create({
      userId: req.user._id,
      movieId,
      paymentId: resolvedPaymentId,
      seatsBooked: finalSeatsBooked,
      selectedSeats: hasManualSeatSelection
        ? [...normalizedSelectedSeats].sort((a, b) => a - b)
        : [],
      showDate,
      showTime,
      totalPrice,
      paymentMethod: resolvedPaymentMethod,
    });

    // Reduce available seats
    movie.availableSeats -= finalSeatsBooked;
    await movie.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('movieId', 'title language poster showTime price')
      .populate('userId', 'name email')
      .populate('paymentId', 'transactionId paymentMethod status amount');

    res.status(201).json(populatedBooking);
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @GET /api/bookings/my  (user's own bookings)
const getMyBookings = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authorized, please login again' });
    }

    const bookings = await Booking.find({ userId: req.user._id })
      .populate('movieId', 'title language poster showTime price genre')
      .populate('paymentId', 'transactionId paymentMethod status amount')
      .sort({ createdAt: -1 });

    const formatted = bookings.map((booking) => {
      const bookingObj = booking.toObject();
      return {
        ...bookingObj,
        watchStatus: getWatchStatus(bookingObj),
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @GET /api/bookings/all  (admin)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('movieId', 'title language poster showTime price')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @PUT /api/bookings/:id/cancel
const cancelBooking = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authorized, please login again' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    // Restore seats
    const movie = await Movie.findById(booking.movieId);
    if (movie) {
      movie.availableSeats += booking.seatsBooked;
      await movie.save();
    }

    booking.status = 'cancelled';
    await booking.save();

    if (booking.paymentId) {
      const payment = await Payment.findById(booking.paymentId);
      if (payment && payment.status === 'success') {
        payment.status = 'refunded';
        await payment.save();
      }
    }

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @GET /api/bookings/stats  (admin)
const getStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments({ status: 'confirmed' });
    const totalRevenue = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalMovies = await Movie.countDocuments({ isActive: true });
    const recentBookings = await Booking.find({ status: 'confirmed' })
      .populate('movieId', 'title')
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalMovies,
      recentBookings,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @GET /api/bookings/occupied?movieId=...&showDate=...&showTime=...
const getOccupiedSeats = async (req, res) => {
  try {
    const { movieId, showDate, showTime } = req.query;

    if (!movieId || !showDate || !showTime) {
      return res.status(400).json({ message: 'movieId, showDate and showTime are required' });
    }

    const bookedSeats = await getBookedSeatsForShow(movieId, showDate, showTime);
    res.json({ bookedSeats });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  cancelBooking,
  getStats,
  getOccupiedSeats,
};
