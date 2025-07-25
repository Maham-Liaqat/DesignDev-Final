import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_CONFIG from '../config/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Get token from query string
  const query = new URLSearchParams(location.search);
  const token = query.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Invalid or missing token.', { position: 'top-center' });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.', { position: 'top-center' });
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_CONFIG.BASE_URL}/reset-password`, { token, newPassword });
      if (res.data.success) {
        toast.success('Password reset successful! You can now log in.', { position: 'top-center', autoClose: 4000 });
        setTimeout(() => navigate('/'), 2000);
      } else {
        toast.error(res.data.error || 'Failed to reset password.', { position: 'top-center' });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reset password.', { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 400 }}>
      <div className="card shadow-lg p-4 mb-5" style={{ borderRadius: 24, background: 'linear-gradient(135deg, #fff 80%, #f5debc 100%)' }}>
        <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 24 }}>Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-control"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              minLength={6}
              required
              placeholder="Enter new password"
            />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword; 