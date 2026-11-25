import React from "react";
import { Navigate } from "react-router-dom";

function PrivateRoute({ children, roleRequired }) {
  const token = localStorage.getItem("token");
  let role = localStorage.getItem("role");

  if (role && role.startsWith("ROLE_")) {
    role = role.replace("ROLE_", "");
  }

  if (!token) {
    return <Navigate to="/login" />;
  }
  
  if (roleRequired && role !== roleRequired) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
}

export default PrivateRoute;