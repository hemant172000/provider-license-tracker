import React, { useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await API.post("/auth/forgot-password", { email });
      setMessage(response.data.message || "Password reset link sent to your email");
      setEmailSent(true);
    } catch (err) {
      console.error("Forgot password error:", err);
      if (err.response?.status === 404) {
        setError("No account found with this email address");
      } else {
        setError(err.response?.data?.error || "Failed to send reset link. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <div className="forgot-header">
          <Link to="/login" className="back-link">
            <i className="fas fa-arrow-left"></i> Back to Login
          </Link>
          <div className="forgot-logo">
            <i className="fas fa-key"></i>
          </div>
          <h2 className="forgot-title">Forgot Password?</h2>
          <p className="forgot-subtitle">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {!emailSent ? (
          <form onSubmit={handleSubmit} className="forgot-form">
            <div className="input-group">
              <label className="input-label">
                <i className="fas fa-envelope"></i> Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                className="forgot-input"
                autoFocus
              />
            </div>

            {error && (
              <div className="forgot-error">
                <i className="fas fa-exclamation-circle"></i> {error}
              </div>
            )}

            <button 
              type="submit" 
              className="forgot-button" 
              disabled={loading}
            >
              {loading ? (
                <><i className="fas fa-spinner fa-spin"></i> Sending...</>
              ) : (
                <><i className="fas fa-paper-plane"></i> Send Reset Link</>
              )}
            </button>
          </form>
        ) : (
          <div className="success-message">
            <i className="fas fa-check-circle"></i>
            <h3>Check Your Email</h3>
            <p>{message}</p>
            <p className="email-sent-to">We sent a reset link to: <strong>{email}</strong></p>
            <Link to="/login" className="back-to-login">
              <i className="fas fa-sign-in-alt"></i> Return to Login
            </Link>
          </div>
        )}

        
      </div>
    </div>
  );
}

export default ForgotPassword;