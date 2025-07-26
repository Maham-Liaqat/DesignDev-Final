import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import API_CONFIG from "../config/api";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const token = query.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);
    
    if (!newPassword || !confirm) {
      setError("Please fill in all fields.");
      setIsLoading(false);
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }
    
    try {
      const res = await axios.post(`${API_CONFIG.BASE_URL}/reset-password`, {
        token,
        newPassword,
      });
      
      if (res.data.success) {
        setMessage("✅ Password reset successful! Redirecting to login...");
        setIsLoading(false);
        
        // Start countdown for auto-navigation
        let count = 3;
        setCountdown(count);
        const countdownInterval = setInterval(() => {
          count--;
          setCountdown(count);
          if (count <= 0) {
            clearInterval(countdownInterval);
            navigate("/");
          }
        }, 1000);
        
      } else {
        setError(res.data.error || "Something went wrong.");
        setIsLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
        <div className="alert alert-danger shadow" style={{ maxWidth: 400 }}>
          Invalid or missing reset token.
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh", background: "#f0f2f5" }}>
      <div className="card shadow p-4" style={{ maxWidth: 400, width: "100%", borderRadius: 16 }}>
        <h2 className="mb-4 text-center" style={{ color: "#4e8cff", fontWeight: 700 }}>Reset Password</h2>
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
          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-control"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              minLength={6}
              required
              placeholder="Confirm new password"
            />
          </div>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          {message && (
            <div className="alert alert-success py-2">
              {message}
              {countdown > 0 && (
                <div className="mt-2 text-muted">
                  Redirecting in {countdown} seconds...
                </div>
              )}
            </div>
          )}
          <button 
            type="submit" 
            className="btn btn-primary w-100 mt-2" 
            style={{ background: "#4e8cff", border: "none" }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;