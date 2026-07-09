import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * Route guard component to restrict access to authenticated users
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show a premium loading screen if auth state is being verified
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-4" />
        <p className="text-sm font-medium tracking-wide">Loading authorization state...</p>
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
