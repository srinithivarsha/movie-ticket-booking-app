import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Clock, Globe, Users, Calendar, ArrowLeft, Ticket, Film } from 'lucide-react';
import { getMovieById } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './MovieDetailPage.css';

export default function MovieDetailPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMovieById(id);
        setMovie(res.data);
      } catch {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!movie) return null;

  const seatPct = Math.round((movie.availableSeats / movie.totalSeats) * 100);

  return (
    <div className="detail-page">
      {/* Backdrop */}
      <div className="detail-backdrop">
        <img src={movie.poster} alt="" onError={(e) => e.target.style.display='none'} />
        <div className="backdrop-overlay" />
      </div>

      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="detail-layout">
          {/* Poster */}
          <div className="detail-poster">
            <img
              src={movie.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=560&fit=crop'}
              alt={movie.title}
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=560&fit=crop'; }}
            />
          </div>

          {/* Info */}
          <div className="detail-info">
            <div className="detail-badges">
              <span className="badge badge-red">{movie.genre}</span>
              <span className="badge badge-blue">{movie.language}</span>
              <span className="badge badge-gold">
                <Star size={11} fill="currentColor" /> {movie.rating}/10
              </span>
            </div>

            <h1 className="detail-title">{movie.title}</h1>

            <div className="detail-meta-row">
              <div className="detail-meta-item">
                <Clock size={14} />
                <span>{movie.duration}</span>
              </div>
              <div className="detail-meta-item">
                <Globe size={14} />
                <span>{movie.language}</span>
              </div>
              <div className="detail-meta-item">
                <Users size={14} />
                <span>{movie.availableSeats} seats left</span>
              </div>
            </div>

            {movie.description && (
              <div className="detail-section">
                <h3>About the Movie</h3>
                <p className="detail-description">{movie.description}</p>
              </div>
            )}

            {movie.cast?.length > 0 && (
              <div className="detail-section">
                <h3><Film size={14} /> Cast</h3>
                <div className="cast-list">
                  {movie.cast.map((c, i) => (
                    <div key={i} className="cast-pill">
                      <div className="cast-avatar">{c.charAt(0)}</div>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {movie.showDates?.length > 0 && (
              <div className="detail-section">
                <h3><Calendar size={14} /> Show Dates</h3>
                <div className="date-list">
                  {movie.showDates.map((d, i) => (
                    <span key={i} className="date-pill">{d}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Booking Card */}
            <div className="booking-card">
              <div className="booking-card-row">
                <div>
                  <div className="booking-price">₹{movie.price} <span>per seat</span></div>
                  <div className="booking-showtime">🕐 {movie.showTime}</div>
                </div>
                <div className="seat-status">
                  <div className="seat-pct-bar">
                    <div className="seat-pct-fill" style={{
                      width: `${seatPct}%`,
                      background: seatPct > 50 ? 'var(--success)' : seatPct > 20 ? 'var(--gold)' : 'var(--primary)'
                    }} />
                  </div>
                  <span className="seat-pct-label">{movie.availableSeats}/{movie.totalSeats} available</span>
                </div>
              </div>

              {movie.availableSeats === 0 ? (
                <div className="alert alert-error">😔 Housefull! No seats available</div>
              ) : user ? (
                <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => navigate(`/book/${movie._id}`)}>
                  <Ticket size={18} /> Book Tickets
                </button>
              ) : (
                <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                  <Ticket size={18} /> Login to Book
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
