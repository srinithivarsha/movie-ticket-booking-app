import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const res = await loginUser(form);
      const { token, ...userData } = res.data;
      login(userData, token);
      toast.success(`Welcome back, ${userData.name}! 🎬`);
      navigate(userData.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ email: 'admin@bookmyshow.com', password: 'admin123' });
    else setForm({ email: 'user@example.com', password: 'user123' });
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🎬</div>
          <h1>Welcome Back</h1>
          <p>Sign in to book your favourite movies</p>
        </div>

        <div className="demo-buttons">
          <button className="demo-btn" onClick={() => fillDemo('user')}>
            👤 Demo User
          </button>
          <button className="demo-btn admin" onClick={() => fillDemo('admin')}>
            🛠️ Demo Admin
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <div className="input-icon-wrap">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                name="email"
                className="form-control"
                style={{ paddingLeft: '42px' }}
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-icon-wrap">
              <Lock size={16} className="input-icon" />
              <input
                type={showPwd ? 'text' : 'password'}
                name="password"
                className="form-control"
                style={{ paddingLeft: '42px', paddingRight: '42px' }}
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
              />
              <button type="button" className="input-icon-right" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            {loading ? <div className="btn-spinner" /> : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
