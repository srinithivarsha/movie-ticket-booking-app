import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all fields');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await registerUser({ name: form.name, email: form.email, password: form.password });
      const { token, ...userData } = res.data;
      login(userData, token);
      toast.success(`Account created! Welcome, ${userData.name}! 🎬`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🍿</div>
          <h1>Create Account</h1>
          <p>Join millions who book with BookMyShow</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <div className="input-icon-wrap">
              <User size={16} className="input-icon" />
              <input type="text" name="name" className="form-control" style={{ paddingLeft: '42px' }}
                placeholder="Your full name" value={form.name} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <div className="input-icon-wrap">
              <Mail size={16} className="input-icon" />
              <input type="email" name="email" className="form-control" style={{ paddingLeft: '42px' }}
                placeholder="Your email address" value={form.email} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-icon-wrap">
              <Lock size={16} className="input-icon" />
              <input type={showPwd ? 'text' : 'password'} name="password" className="form-control"
                style={{ paddingLeft: '42px', paddingRight: '42px' }}
                placeholder="Min 6 characters" value={form.password} onChange={handleChange} />
              <button type="button" className="input-icon-right" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="input-icon-wrap">
              <Lock size={16} className="input-icon" />
              <input type="password" name="confirmPassword" className="form-control"
                style={{ paddingLeft: '42px' }}
                placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            {loading ? <div className="btn-spinner" /> : <><UserPlus size={18} /> Create Account</>}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
