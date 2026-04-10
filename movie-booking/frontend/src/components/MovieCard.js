import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Users, Globe } from 'lucide-react';
import './MovieCard.css';

export default function MovieCard({ movie }) {
  const seatPct = Math.round((movie.availableSeats / movie.totalSeats) * 100);
  const seatColor = seatPct > 50 ? 'green' : seatPct > 20 ? 'gold' : 'red';

  return (
    <div className="movie-card card">
      <div className="movie-poster">
        <img
          src={movie.poster || `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=560&fit=crop`}
          alt={movie.title}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=560&fit=crop';
          }}
        />
        <div className="poster-overlay">
          <span className={`badge badge-${seatColor === 'green' ? 'green' : seatColor === 'gold' ? 'gold' : 'red'}`}>
            {movie.availableSeats} seats left
          </span>
        </div>
        <div className="rating-badge">
          <Star size={12} fill="currentColor" />
          {movie.rating}
        </div>
      </div>

      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        <div className="movie-meta">
          <span className="meta-item"><Globe size={12} /> {movie.language}</span>
          <span className="meta-item"><Clock size={12} /> {movie.duration}</span>
        </div>
        <div className="movie-genre-badge">
          <span className="badge badge-blue">{movie.genre}</span>
        </div>
        <div className="movie-showtime">
          <span className="showtime-label">Next Show</span>
          <span className="showtime-value">{movie.showTime}</span>
        </div>
        <div className="seat-bar">
          <div className="seat-bar-fill" style={{ width: `${seatPct}%`, background: seatColor === 'green' ? 'var(--success)' : seatColor === 'gold' ? 'var(--gold)' : 'var(--primary)' }} />
        </div>
        <div className="movie-price-row">
          <span className="movie-price">₹{movie.price}</span>
          <Link to={`/movies/${movie._id}`} className="btn btn-primary btn-sm">Book Now</Link>
        </div>
      </div>
    </div>
  );
}
