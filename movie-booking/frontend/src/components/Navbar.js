import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, LogOut, User, Ticket, LayoutDashboard, Menu, X } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          <div className="brand-icon"><Film size={20} /></div>
          <span className="brand-text">Book<span className="brand-red">My</span>Show</span>
        </Link>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Movies</Link>

          {user ? (
            <>
              {user.role === 'admin' ? (
                <Link to="/admin" className="nav-link" onClick={() => setMenuOpen(false)}>
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
              ) : (
                <Link to="/my-bookings" className="nav-link" onClick={() => setMenuOpen(false)}>
                  <Ticket size={15} /> My Bookings
                </Link>
              )}
              <div className="nav-user">
                <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                <span className="user-name">{user.name}</span>
                {user.role === 'admin' && <span className="badge badge-red">Admin</span>}
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
                <User size={14} /> Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
