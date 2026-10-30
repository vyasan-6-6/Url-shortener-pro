import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages for optimized initial chunk loading speed
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ServerError = lazy(() => import('./pages/ServerError'));

const App: React.FC = () => {
  return (
    <Router>
      {/* Premium Toast Notification Pop-ups container */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#0f172a', /* slate-900 */
            color: '#f8fafc', /* slate-50 */
            border: '1px solid #1e293b', /* slate-800 */
            borderRadius: '0.75rem',
            fontSize: '0.875rem'
          },
          success: {
            iconTheme: {
              primary: '#8b5cf6', /* violet-500 */
              secondary: '#f8fafc'
            }
          }
        }}
      />
      
      {/* Graceful loading screen while lazy chunks resolve */}
      <Suspense fallback={
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 tracking-wider font-bold animate-pulse uppercase">Loading Shortcut Pro...</p>
        </div>
      }>
        <Routes>
          {/* Protected Dashboard Route */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Public Authentication Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Server Error Page */}
          <Route path="/500" element={<ServerError />} />

          {/* Catch-all 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
