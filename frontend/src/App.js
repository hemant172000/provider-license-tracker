import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import ProviderDashboard from "./components/ProviderDashboard";
import TeamDashboard from "./components/TeamDashboard";
import GroupManagerDashboard from "./components/GroupManagerDashboard";
import TeamLeaderDashboard from "./components/TeamLeaderDashboard";  // ← ADD THIS
import PrivateRoute from "./components/PrivateRoute";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import useActivityTracking from './hooks/useActivityTracking';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [userRole, setUserRole] = useState(localStorage.getItem("role") || "");

  const isLoggedIn = !!localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const shouldTrack = isLoggedIn && (role === 'TEAM_MEMBER' || role === 'TEAM_LEADER');
  // useActivityTracking();

  const handleLogin = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUserRole("");
  };

  return (
    <Router>
      <Routes>
        {/* Public routes - no authentication needed */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        
        {/* Protected routes - require authentication */}
        <Route path="/admin" element={
          <PrivateRoute roleRequired="ADMIN">
            <AdminDashboard />
          </PrivateRoute>
        } />
        
        <Route path="/provider" element={
          <PrivateRoute roleRequired="PROVIDER">
            <ProviderDashboard />
          </PrivateRoute>
        } />
        
        <Route path="/team" element={
          <PrivateRoute roleRequired="TEAM_MEMBER">
            <TeamDashboard />
          </PrivateRoute>
        } />
        
        <Route path="/group-manager" element={
          <PrivateRoute roleRequired="GROUP_MGR">
            <GroupManagerDashboard />
          </PrivateRoute>
        } />
        
        
        <Route path="/team-leader" element={
          <PrivateRoute roleRequired="TEAM_LEADER">
            <TeamLeaderDashboard />
          </PrivateRoute>
        } />
        
        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
      </Routes>
    </Router>
  );
}

export default App;