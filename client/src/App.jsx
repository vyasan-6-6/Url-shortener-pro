import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
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
        
        {/* Catch-all 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
