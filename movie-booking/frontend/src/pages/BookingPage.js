import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Ticket, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMovieById, createBooking, getOccupiedSeats, createPayment } from '../services/api';
import './BookingPage.css';

const MAX_SEATS_PER_BOOKING = 10;
const PAYMENT_METHODS = ['UPI', 'Card', 'NetBanking', 'Wallet', 'Cash'];

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await getMovieById(id);
        setMovie(res.data);
        if (res.data.showDates?.length > 0) setSelectedDate(res.data.showDates[0]);
      } catch {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id, navigate]);

  useEffect(() => {
    const fetchOccupied = async () => {
      if (!movie || !selectedDate) return;
      try {
        const res = await getOccupiedSeats({
          movieId: movie._id,
          showDate: selectedDate,
          showTime: movie.showTime,
        });
        setOccupiedSeats(res.data?.bookedSeats || []);
      } catch (err) {
        const statusCode = err?.response?.status;
        const backendMessage = err?.response?.data?.message;

        if (!err?.response) {
          toast.error('Cannot connect to backend. Please start backend on port 5000.');
        } else if (statusCode === 401) {
          toast.error('Session expired. Please login again.');
          navigate('/login');
        } else {
          toast.error(backendMessage || 'Failed to load seats');
        }

        // Keep UI usable; booking API will still validate seat conflicts.
        setOccupiedSeats([]);
      }
    };
    fetchOccupied();
  }, [movie, selectedDate, navigate]);

  useEffect(() => {
    setSelectedSeats((prev) => prev.filter((seat) => !occupiedSeats.includes(seat)));
  }, [occupiedSeats]);

  const toggleSeat = (seatNumber) => {
    if (occupiedSeats.includes(seatNumber)) return;

    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats((prev) => prev.filter((seat) => seat !== seatNumber));
      return;
    }

    if (selectedSeats.length >= MAX_SEATS_PER_BOOKING) {
      toast.error(`You can book maximum ${MAX_SEATS_PER_BOOKING} seats`);
      return;
    }

    setSelectedSeats((prev) => [...prev, seatNumber].sort((a, b) => a - b));
  };

  const handleBook = async () => {
    if (!selectedDate) return toast.error('Please select a show date');
    if (selectedSeats.length < 1) return toast.error('Please select at least 1 seat');

    setBooking(true);
    try {
      const paymentRes = await createPayment({
        movieId: movie._id,
        seatsBooked: selectedSeats.length,
        selectedSeats,
        paymentMethod,
      });
      toast.success('Payment completed successfully');

      await createBooking({
        movieId: movie._id,
        seatsBooked: selectedSeats.length,
        selectedSeats,
        showDate: selectedDate,
        showTime: movie.showTime,
        paymentMethod,
        paymentId: paymentRes.data?._id,
      });
      toast.success('Booking confirmed. Ticket added to My Bookings');
      setTimeout(() => navigate('/my-bookings'), 900);
    } catch (err) {
      const statusCode = err?.response?.status;
      const backendMessage = err?.response?.data?.message;
      const backendDetail = err?.response?.data?.error;
      if (!err?.response) {
        toast.error('Cannot connect to server. Please start backend on port 5000.');
      } else if (statusCode === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else if (statusCode === 400 || statusCode === 404 || statusCode === 409) {
        toast.error(backendDetail || backendMessage || 'Please check booking details and try again');
      } else if (statusCode >= 500) {
        toast.error(backendDetail || backendMessage || 'Server error while confirming booking');
      } else {
        toast.error(backendDetail || backendMessage || 'Booking failed. Please try again.');
      }
      if (movie && selectedDate) {
        try {
          const refresh = await getOccupiedSeats({
            movieId: movie._id,
            showDate: selectedDate,
            showTime: movie.showTime,
          });
          setOccupiedSeats(refresh.data?.bookedSeats || []);
        } catch {
          // Ignore refresh failure after booking error
        }
      }
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!movie) return null;

  const seats = selectedSeats.length;
  const convenienceFee = seats * 25;
  const total = seats * movie.price + convenienceFee;
  const seatNumbers = Array.from({ length: movie.totalSeats }, (_, i) => i + 1);

  return (
    <div className="booking-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="booking-layout">
          <div className="booking-movie-info">
            <img
              src={movie.poster}
              alt={movie.title}
              className="booking-poster"
              onError={(e) => {
                e.target.src =
                  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=560&fit=crop';
              }}
            />
            <div>
              <h2 className="booking-movie-title">{movie.title}</h2>
              <div className="booking-movie-meta">
                <span className="badge badge-blue">{movie.language}</span>
                <span className="badge badge-red">{movie.genre}</span>
              </div>
              <p className="booking-movie-time">{movie.showTime}</p>
              <p className="booking-available">
                <span className={movie.availableSeats < 20 ? 'text-red' : 'text-green'}>
                  {movie.availableSeats} seats available
                </span>
              </p>
            </div>
          </div>

          <div className="booking-form-card card">
            <h2 className="booking-form-title"><Ticket size={20} /> Select Your Seats</h2>

            <div className="form-group">
              <label>Select Date</label>
              <div className="date-selector">
                {movie.showDates?.length > 0 ? (
                  movie.showDates.map((d) => (
                    <button
                      key={d}
                      className={`date-opt ${selectedDate === d ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedDate(d);
                        setSelectedSeats([]);
                      }}
                    >
                      {d}
                    </button>
                  ))
                ) : (
                  <input
                    type="date"
                    className="form-control"
                    value={selectedDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedSeats([]);
                    }}
                  />
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Select Seat Numbers (max 10)</label>
              <div className="selected-seats-bar">
                {selectedSeats.length > 0 ? (
                  <span>{selectedSeats.join(', ')}</span>
                ) : (
                  <span className="text-muted">No seats selected yet</span>
                )}
              </div>
            </div>

            <div className="seat-grid-visual">
              <div className="screen-bar">SCREEN</div>
              <div className="seat-grid">
                {seatNumbers.map((seatNumber) => {
                  const isBooked = occupiedSeats.includes(seatNumber);
                  const isSelected = selectedSeats.includes(seatNumber);
                  return (
                    <button
                      key={seatNumber}
                      type="button"
                      className={`seat-number ${isBooked ? 'booked' : isSelected ? 'selected' : 'available'}`}
                      onClick={() => toggleSeat(seatNumber)}
                      disabled={isBooked}
                    >
                      {seatNumber}
                    </button>
                  );
                })}
              </div>
              <div className="seat-legend">
                <span><div className="seat-dot available" />Available</span>
                <span><div className="seat-dot selected" />Selected</span>
                <span><div className="seat-dot booked" />Booked</span>
              </div>
            </div>

            <div className="form-group">
              <label>Payment Method</label>
              <select
                className="form-control"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            <div className="price-summary">
              <div className="price-row">
                <span>Price per seat</span>
                <span>Rs {movie.price}</span>
              </div>
              <div className="price-row">
                <span>Seats</span>
                <span>x {seats}</span>
              </div>
              <div className="price-row">
                <span>Convenience fee</span>
                <span>Rs {convenienceFee}</span>
              </div>
              <div className="price-divider" />
              <div className="price-row total">
                <span>Total Amount</span>
                <span>Rs {total}</span>
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleBook}
              disabled={booking || !selectedDate || movie.availableSeats === 0 || seats === 0}
            >
              {booking ? (
                <>
                  <div className="btn-spinner" /> Processing...
                </>
              ) : (
                <>
                  <Ticket size={18} /> Confirm Booking
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
