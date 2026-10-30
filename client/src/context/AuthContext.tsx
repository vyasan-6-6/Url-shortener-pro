import React, { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import type { User } from '../types';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (userData: User, tokenData: string) => void;
  logout: () => void;
  API_URL: string;
}

// Create the Context
const AuthContext = createContext<AuthContextType | null>(null);

// Base backend URL config
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. On initial load: Check if user details are saved in localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
      } catch (err) {
        console.error('Failed to parse stored user:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // 2. Login function: Saves user details to state and local storage
  const login = (userData: User, tokenData: string) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', tokenData);
  };

  // 3. Logout function: Clears user details from state and local storage
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, API_URL }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext easily in components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
