import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Calendar, Clock, Film, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMyBookings, cancelBooking } from '../services/api';
import './BookingHistoryPage.css';

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      const res = await getMyBookings();
      setBookings(res.data);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking(id);
      toast.success('Booking cancelled. Seats restored.');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const getWatchLabel = (watchStatus) => {
    if (watchStatus === 'watched') return 'Watched';
    if (watchStatus === 'going_to_watch') return 'Going to Watch';
    return 'Cancelled';
  };

  return (
    <div className="history-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title"><Ticket size={26} /> My Bookings</h1>
            <p className="page-subtitle">All your movie ticket bookings in one place</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>Browse Movies</button>
        </div>

        {bookings.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎭</div>
            <h3>No bookings yet</h3>
            <p>Book your first movie ticket and it will appear here</p>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/')}>
              Explore Movies
            </button>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((b) => (
              <div key={b._id} className={`booking-item ${b.status === 'cancelled' ? 'cancelled' : ''}`}>
                <div className="booking-poster">
                  <img
                    src={b.movieId?.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&h=280&fit=crop'}
                    alt={b.movieId?.title}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&h=280&fit=crop'; }}
                  />
                </div>

                <div className="booking-content">
                  <div className="booking-top">
                    <div>
                      <h3 className="booking-movie-name">
                        <Film size={16} /> {b.movieId?.title || 'Movie'}
                      </h3>
                      <div className="booking-badges">
                        <span className={`badge ${b.status === 'confirmed' ? 'badge-green' : 'badge-red'}`}>
                          {b.status}
                        </span>
                        <span className={`badge ${b.watchStatus === 'watched' ? 'badge-blue' : b.watchStatus === 'going_to_watch' ? 'badge-gold' : 'badge-red'}`}>
                          {getWatchLabel(b.watchStatus)}
                        </span>
                        <span className="badge badge-blue">{b.movieId?.language}</span>
                        <span className="badge badge-gold">{b.movieId?.genre}</span>
                      </div>
                    </div>
                    <div className="booking-id">#{b.bookingId}</div>
                  </div>

                  <div className="booking-details">
                    <div className="booking-detail-item">
                      <Calendar size={14} />
                      <span>{b.showDate}</span>
                    </div>
                    <div className="booking-detail-item">
                      <Clock size={14} />
                      <span>{b.showTime}</span>
                    </div>
                    <div className="booking-detail-item">
                      <Ticket size={14} />
                      <span>
                        {b.selectedSeats?.length > 0
                          ? `Seat ${b.selectedSeats.join(', ')}`
                          : `${b.seatsBooked} seat${b.seatsBooked > 1 ? 's' : ''}`}
                      </span>
                    </div>
                    <div className="booking-detail-item">
                      <span>Pay: {b.paymentMethod || 'UPI'}</span>
                    </div>
                    {b.paymentId?.transactionId && (
                      <div className="booking-detail-item">
                        <span>Txn: {b.paymentId.transactionId}</span>
                      </div>
                    )}
                  </div>

                  <div className="booking-footer">
                    <div className="booking-total">
                      <span>Total Paid</span>
                      <strong>₹{b.totalPrice}</strong>
                    </div>
                    {b.status === 'confirmed' && (
                      <button className="btn btn-secondary btn-sm cancel-btn" onClick={() => handleCancel(b._id)}>
                        <XCircle size={14} /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
