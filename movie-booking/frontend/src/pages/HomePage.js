import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { getMovies } from '../services/api';
import './HomePage.css';

const LANGUAGES = ['All', 'Hindi', 'English', 'Telugu', 'Tamil', 'Kannada', 'Malayalam'];
const GENRES = ['All', 'Action', 'Drama', 'Comedy', 'Romance', 'Sci-Fi', 'Superhero', 'Thriller'];

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('All');
  const [genre, setGenre] = useState('All');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (language !== 'All') params.language = language;
      if (genre !== 'All') params.genre = genre;
      const res = await getMovies(params);
      setMovies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, language, genre]);

  useEffect(() => { fetchMovies(); }, [fetchMovies]);

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-overlay" />
        <div className="hero-content container">
          <div className="hero-badge">🎬 Now Showing</div>
          <h1 className="hero-title">Book Your<br /><span>Movie Experience</span></h1>
          <p className="hero-subtitle">14 movies, hundreds of shows. Find your perfect seat.</p>

          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search movies, languages, genres..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        {/* Filters */}
        <div className="filters-bar">
          <div className="filter-section">
            <SlidersHorizontal size={16} className="filter-icon" />
            <span className="filter-label">Language:</span>
            <div className="filter-pills">
              {LANGUAGES.map(l => (
                <button
                  key={l}
                  className={`filter-pill ${language === l ? 'active' : ''}`}
                  onClick={() => setLanguage(l)}
                >{l}</button>
              ))}
            </div>
          </div>
          <div className="filter-section">
            <Filter size={16} className="filter-icon" />
            <span className="filter-label">Genre:</span>
            <div className="filter-pills">
              {GENRES.map(g => (
                <button
                  key={g}
                  className={`filter-pill ${genre === g ? 'active' : ''}`}
                  onClick={() => setGenre(g)}
                >{g}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Results header */}
        <div className="results-header">
          <h2 className="results-title">
            {debouncedSearch ? `Results for "${debouncedSearch}"` : 'All Movies'}
          </h2>
          {!loading && <span className="results-count">{movies.length} movies found</span>}
        </div>

        {/* Movies Grid */}
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : movies.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎬</div>
            <h3>No movies found</h3>
            <p>Try adjusting your search or filters</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => { setSearch(''); setLanguage('All'); setGenre('All'); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="movies-grid">
            {movies.map(movie => <MovieCard key={movie._id} movie={movie} />)}
          </div>
        )}
      </div>
    </div>
  );
}
