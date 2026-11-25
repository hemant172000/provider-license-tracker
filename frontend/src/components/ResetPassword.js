import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import API from "../services/api";
import "./ResetPassword.css";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const navigate = useNavigate();
  const { token } = useParams();

  // Password strength checker
  const checkPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.match(/[a-z]/) && pwd.match(/[A-Z]/)) strength++;
    if (pwd.match(/[0-9]/)) strength++;
    if (pwd.match(/[^a-zA-Z0-9]/)) strength++;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
  };

  const getStrengthText = () => {
    switch(passwordStrength) {
      case 0: return "Very Weak";
      case 1: return "Weak";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Strong";
      default: return "";
    }
  };

  const getStrengthColor = () => {
    switch(passwordStrength) {
      case 0: return "#dc2626";
      case 1: return "#f59e0b";
      case 2: return "#f59e0b";
      case 3: return "#10b981";
      case 4: return "#10b981";
      default: return "#e5e7eb";
    }
  };

  const validateForm = () => {
    if (!password) {
      setError("Password is required");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await API.post(`/auth/reset-password/${token}`, { password });
      setMessage(response.data.message || "Password reset successfully!");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      console.error("Reset password error:", err);
      if (err.response?.status === 400) {
        setError("Invalid or expired reset link. Please request a new one.");
        setValidToken(false);
      } else {
        setError(err.response?.data?.error || "Failed to reset password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!validToken) {
    return (
      <div className="reset-container">
        <div className="reset-card">
          <div className="reset-header">
            <div className="reset-logo">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2 className="reset-title">Invalid Reset Link</h2>
            <p className="reset-subtitle">
              This password reset link is invalid or has expired.
            </p>
            <Link to="/forgot-password" className="reset-button-link">
              Request New Reset Link
            </Link>
            <Link to="/login" className="back-to-login-link">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-container">
      <div className="reset-card">
        <div className="reset-header">
          <div className="reset-logo">
            <i className="fas fa-lock"></i>
          </div>
          <h2 className="reset-title">Create New Password</h2>
          <p className="reset-subtitle">
            Please enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="reset-form">
          <div className="input-group">
            <label className="input-label">
              <i className="fas fa-lock"></i> New Password
            </label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
                className="reset-input"
                autoFocus
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
              </button>
            </div>
            {password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill"
                    style={{ 
                      width: `${(passwordStrength / 4) * 100}%`,
                      backgroundColor: getStrengthColor()
                    }}
                  />
                </div>
                <span className="strength-text" style={{ color: getStrengthColor() }}>
                  {getStrengthText()}
                </span>
              </div>
            )}
          </div>

          <div className="input-group">
            <label className="input-label">
              <i className="fas fa-check-circle"></i> Confirm Password
            </label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="reset-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <i className={showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
              </button>
            </div>
          </div>

          <div className="password-requirements">
            <p>Password must contain:</p>
            <ul>
              <li className={password.length >= 8 ? "valid" : ""}>
                <i className={password.length >= 8 ? "fas fa-check-circle" : "fas fa-circle"}></i>
                At least 8 characters
              </li>
              <li className={/[a-z]/.test(password) && /[A-Z]/.test(password) ? "valid" : ""}>
                <i className={/[a-z]/.test(password) && /[A-Z]/.test(password) ? "fas fa-check-circle" : "fas fa-circle"}></i>
                Uppercase & lowercase letters
              </li>
              <li className={/[0-9]/.test(password) ? "valid" : ""}>
                <i className={/[0-9]/.test(password) ? "fas fa-check-circle" : "fas fa-circle"}></i>
                At least one number
              </li>
              <li className={/[^a-zA-Z0-9]/.test(password) ? "valid" : ""}>
                <i className={/[^a-zA-Z0-9]/.test(password) ? "fas fa-check-circle" : "fas fa-circle"}></i>
                At least one special character
              </li>
            </ul>
          </div>

          {error && (
            <div className="reset-error">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          {message && (
            <div className="reset-success">
              <i className="fas fa-check-circle"></i> {message}
              <div className="redirect-message">Redirecting to login...</div>
            </div>
          )}

          <button 
            type="submit" 
            className="reset-button" 
            disabled={loading}
          >
            {loading ? (
              <><i className="fas fa-spinner fa-spin"></i> Resetting...</>
            ) : (
              <><i className="fas fa-key"></i> Reset Password</>
            )}
          </button>
        </form>

        <div className="reset-footer">
          <Link to="/login">
            <i className="fas fa-sign-in-alt"></i> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;