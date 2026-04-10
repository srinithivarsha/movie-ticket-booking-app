const Payment = require('../models/Payment');
const Movie = require('../models/Movie');

const normalizePaymentMethod = (rawMethod) => {
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

  return paymentMethodMap[String(rawMethod || '').trim().toLowerCase()] || 'UPI';
};

// @POST /api/payments
const createPayment = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authorized, please login again' });
    }

    const { movieId, seatsBooked, selectedSeats = [], paymentMethod } = req.body;
    if (!movieId) return res.status(400).json({ message: 'movieId is required' });

    const seatCount = Array.isArray(selectedSeats) && selectedSeats.length > 0
      ? selectedSeats.length
      : Number(seatsBooked);

    if (!Number.isInteger(seatCount) || seatCount < 1 || seatCount > 10) {
      return res.status(400).json({ message: 'Invalid seat count for payment' });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    const amount = seatCount * movie.price;
    const method = normalizePaymentMethod(paymentMethod);

    // Mock payment success flow
    const payment = await Payment.create({
      userId: req.user._id,
      movieId,
      amount,
      seats: seatCount,
      paymentMethod: method,
      status: 'success',
    });

    res.status(201).json(payment);
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @GET /api/payments/my
const getMyPayments = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authorized, please login again' });
    }

    const payments = await Payment.find({ userId: req.user._id })
      .populate('movieId', 'title poster language')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createPayment, getMyPayments };
