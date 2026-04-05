/*
  Route-Guard für geschützte Bereiche.
  Optional mit Rollenprüfung, z. B. nur für Trainer.
*/

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const ProtectedRoute = ({ requiredRole, children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div>Laden...</div>; 
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Rolle passt nicht -> zurück zur Startseite
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children || <Outlet />;
};

export default ProtectedRoute;