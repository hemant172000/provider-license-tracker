import React, { useState, useEffect } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const navigate = useNavigate();

  // Load saved credentials if remember me was checked
  useEffect(() => {
    const savedUsername = localStorage.getItem("rememberedUsername");
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const validateForm = () => {
    if (!username.trim()) {
      setError("Username is required");
      return false;
    }
    if (!password.trim()) {
      setError("Password is required");
      return false;
    }
    return true;
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const handleCapsLock = (e) => {
    setCapsLockOn(e.getModifierState("CapsLock"));
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError("");

    try {
      const normalizedUsername = username.trim().toLowerCase();
      const response = await API.post("/auth/login", { 
        username: normalizedUsername, 
        password 
      });
      
      const { token, role, fullName } = response.data;

      // Normalize role
      const normalizedRole = role.startsWith("ROLE_") ? role.replace("ROLE_", "") : role;

      // Save token and user info
      localStorage.setItem("token", token);
      localStorage.setItem("role", normalizedRole);
      localStorage.setItem("fullName", fullName);
      localStorage.setItem("username", normalizedUsername);

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("rememberedUsername", normalizedUsername);
      } else {
        localStorage.removeItem("rememberedUsername");
      }

      // Call onLogin callback
      if (onLogin) onLogin(normalizedRole);

      // Redirect based on role
      const roleRoutes = {
        ADMIN: "/admin",
        PROVIDER: "/provider",
        TEAM_MEMBER: "/team",
        GROUP_MGR: "/group-manager",
        TEAM_LEADER: "/team-leader"
      };

      const redirectPath = roleRoutes[normalizedRole];
      if (redirectPath) {
        navigate(redirectPath);
      } else {
        navigate("/unauthorized");
      }
      
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.status === 401) {
        setError("Invalid username or password");
      } else if (err.response?.status === 403) {
        setError("Account locked. Please contact administrator");
      } else if (err.code === "ERR_NETWORK") {
        setError("Cannot connect to server. Please check your connection");
      } else {
        setError(err.response?.data?.error || "Login failed. Please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
           
          </div>
          <p className="login-title">Sign in to your account</p>
        </div>

        <div className="login-form">
          <div className="input-group">
            <label className="input-label">
              <i className="fas fa-user"></i> Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your username"
              className="login-input"
              autoFocus
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              <i className="fas fa-lock"></i> Password
            </label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                onKeyDown={handleCapsLock}
                placeholder="Enter your password"
                className="login-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
              </button>
            </div>
            {capsLockOn && (
              <div className="capslock-warning">
                <i className="fas fa-exclamation-triangle"></i> Caps Lock is on
              </div>
            )}
          </div>

          <div className="login-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>

          <button 
            onClick={handleLogin} 
            className="login-button" 
            disabled={loading}
          >
            {loading ? (
              <><i className="fas fa-spinner fa-spin"></i> Logging in...</>
            ) : (
              <><i className="fas fa-sign-in-alt"></i> Sign In</>
            )}
          </button>

          {error && (
            <div className="login-error">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}
        </div>

        
      </div>
    </div>
  );
}

export default Login;