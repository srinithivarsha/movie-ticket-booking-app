import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Film, Ticket, DollarSign, Users, X, Save, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAdminMovies, createMovie, updateMovie, deleteMovie,
  getAllBookings, getStats
} from '../services/api';
import './AdminDashboard.css';

const EMPTY_FORM = {
  title: '', description: '', genre: 'Action', language: 'Hindi',
  duration: '2h 30m', rating: 7.5, showTime: '10:00 AM',
  showDates: '', availableSeats: 100, totalSeats: 100, price: 250,
  poster: '', cast: '', isActive: true,
};

const TABS = ['Overview', 'Movies', 'Bookings'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('Overview');
  const [movies, setMovies] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMovie, setEditMovie] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [moviesRes, bookingsRes, statsRes] = await Promise.all([
        getAdminMovies(), getAllBookings(), getStats()
      ]);
      setMovies(moviesRes.data);
      setBookings(bookingsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Keep admin metrics live without needing manual browser refresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAll(true);
    }, 15000);

    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchAll(true);
    };

    const onFocus = () => fetchAll(true);

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [fetchAll]);

  useEffect(() => {
    if (tab === 'Overview' || tab === 'Bookings') {
      fetchAll(true);
    }
  }, [tab, fetchAll]);

  const openAdd = () => {
    setEditMovie(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (movie) => {
    setEditMovie(movie);
    setForm({
      ...movie,
      showDates: movie.showDates?.join(', ') || '',
      cast: movie.cast?.join(', ') || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await deleteMovie(id);
      toast.success('Movie deleted');
      fetchAll();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.showTime) return toast.error('Title and showtime are required');
    setSaving(true);
    try {
      const payload = {
        ...form,
        showDates: form.showDates ? form.showDates.split(',').map(d => d.trim()).filter(Boolean) : [],
        cast: form.cast ? form.cast.split(',').map(c => c.trim()).filter(Boolean) : [],
        rating: parseFloat(form.rating),
        availableSeats: parseInt(form.availableSeats),
        totalSeats: parseInt(form.totalSeats),
        price: parseInt(form.price),
      };
      if (editMovie) {
        await updateMovie(editMovie._id, payload);
        toast.success('Movie updated!');
      } else {
        await createMovie(payload);
        toast.success('Movie added!');
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const fc = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="admin-page">
      <div className="container">
        {/* Header */}
        <div className="admin-header">
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">Manage movies, bookings, and more</p>
          </div>
          {tab === 'Movies' && (
            <button className="btn btn-primary" onClick={openAdd}>
              <Plus size={16} /> Add Movie
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {TABS.map(t => (
            <button key={t} className={`admin-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'Overview' && <BarChart3 size={15} />}
              {t === 'Movies' && <Film size={15} />}
              {t === 'Bookings' && <Ticket size={15} />}
              {t}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'Overview' && stats && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon movies"><Film size={24} /></div>
                <div className="stat-value">{stats.totalMovies}</div>
                <div className="stat-label">Active Movies</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon bookings"><Ticket size={24} /></div>
                <div className="stat-value">{stats.totalBookings}</div>
                <div className="stat-label">Total Bookings</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon revenue"><DollarSign size={24} /></div>
                <div className="stat-value">₹{stats.totalRevenue.toLocaleString()}</div>
                <div className="stat-label">Total Revenue</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon users"><Users size={24} /></div>
                <div className="stat-value">{bookings.length}</div>
                <div className="stat-label">All Transactions</div>
              </div>
            </div>

            <div className="recent-bookings">
              <h2>Recent Bookings</h2>
              <div className="mini-table">
                <div className="mini-table-head">
                  <span>Booking ID</span><span>Customer</span><span>Movie</span><span>Amount</span><span>Status</span>
                </div>
                {stats.recentBookings.map(b => (
                  <div key={b._id} className="mini-table-row">
                    <span className="mono">#{b.bookingId}</span>
                    <span>{b.userId?.name}</span>
                    <span>{b.movieId?.title}</span>
                    <span>₹{b.totalPrice}</span>
                    <span><span className="badge badge-green">confirmed</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Movies Tab */}
        {tab === 'Movies' && (
          <div className="movies-tab">
            <div className="admin-movies-grid">
              {movies.map(movie => (
                <div key={movie._id} className={`admin-movie-card ${!movie.isActive ? 'inactive' : ''}`}>
                  <img
                    src={movie.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&h=200&fit=crop'}
                    alt={movie.title}
                    className="admin-movie-img"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&h=200&fit=crop'; }}
                  />
                  <div className="admin-movie-body">
                    <div className="admin-movie-top">
                      <h3>{movie.title}</h3>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <span className="badge badge-blue">{movie.language}</span>
                        {!movie.isActive && <span className="badge badge-red">Inactive</span>}
                      </div>
                    </div>
                    <div className="admin-movie-meta">
                      <span>🕐 {movie.showTime}</span>
                      <span>💺 {movie.availableSeats}/{movie.totalSeats}</span>
                      <span>₹{movie.price}</span>
                      <span>⭐ {movie.rating}</span>
                    </div>
                    <div className="admin-movie-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(movie)}>
                        <Edit2 size={13} /> Edit
                      </button>
                      <button className="btn btn-sm delete-btn" onClick={() => handleDelete(movie._id, movie.title)}>
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {tab === 'Bookings' && (
          <div className="bookings-tab">
            <div className="bookings-table-wrap">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Movie</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Seats</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b._id}>
                      <td className="mono">#{b.bookingId}</td>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">{b.userId?.name?.charAt(0)}</div>
                          <div>
                            <div className="user-cell-name">{b.userId?.name}</div>
                            <div className="user-cell-email">{b.userId?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="movie-cell">{b.movieId?.title}</td>
                      <td>{b.showDate}</td>
                      <td>{b.showTime}</td>
                      <td><strong>{b.seatsBooked}</strong></td>
                      <td><strong>₹{b.totalPrice}</strong></td>
                      <td>
                        <span className={`badge ${b.status === 'confirmed' ? 'badge-green' : 'badge-red'}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editMovie ? 'Edit Movie' : 'Add New Movie'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Movie Title *</label>
                  <input name="title" className="form-control" value={form.title} onChange={fc} placeholder="e.g. Pushpa 2" required />
                </div>
                <div className="form-group">
                  <label>Genre</label>
                  <select name="genre" className="form-control" value={form.genre} onChange={fc}>
                    {['Action','Drama','Comedy','Romance','Sci-Fi','Thriller','Superhero','Horror','Animation'].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea name="description" className="form-control" value={form.description} onChange={fc} placeholder="Movie description..." rows={3} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Language</label>
                  <select name="language" className="form-control" value={form.language} onChange={fc}>
                    {['Hindi','English','Telugu','Tamil','Kannada','Malayalam','Bengali'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input name="duration" className="form-control" value={form.duration} onChange={fc} placeholder="e.g. 2h 30m" />
                </div>
                <div className="form-group">
                  <label>IMDb Rating</label>
                  <input name="rating" type="number" min="0" max="10" step="0.1" className="form-control" value={form.rating} onChange={fc} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Show Time *</label>
                  <input name="showTime" className="form-control" value={form.showTime} onChange={fc} placeholder="e.g. 10:00 AM" required />
                </div>
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input name="price" type="number" className="form-control" value={form.price} onChange={fc} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Total Seats</label>
                  <input name="totalSeats" type="number" className="form-control" value={form.totalSeats} onChange={fc} />
                </div>
                <div className="form-group">
                  <label>Available Seats</label>
                  <input name="availableSeats" type="number" className="form-control" value={form.availableSeats} onChange={fc} />
                </div>
              </div>

              <div className="form-group">
                <label>Poster URL</label>
                <input name="poster" className="form-control" value={form.poster} onChange={fc} placeholder="https://..." />
              </div>

              <div className="form-group">
                <label>Show Dates (comma separated)</label>
                <input name="showDates" className="form-control" value={form.showDates} onChange={fc} placeholder="2024-12-01, 2024-12-02" />
              </div>

              <div className="form-group">
                <label>Cast (comma separated)</label>
                <input name="cast" className="form-control" value={form.cast} onChange={fc} placeholder="Actor 1, Actor 2" />
              </div>

              <div className="form-group">
                <label>
                  <input type="checkbox" name="isActive" checked={form.isActive}
                    onChange={e => setForm({ ...form, isActive: e.target.checked })} style={{ marginRight: 8 }} />
                  Active (visible to users)
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <div className="btn-spinner" /> : <><Save size={15} /> {editMovie ? 'Update' : 'Add'} Movie</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
