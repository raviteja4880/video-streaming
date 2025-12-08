import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlobalLoader from '../components/GlobalLoader';


export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

if (loading) return <GlobalLoader />;


  // Not logged in after loading → redirect
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated → show content
  return children;
}
