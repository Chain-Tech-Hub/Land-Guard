import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useWeb3 } from './Web3Context';

const API_BASE_URL = process.env.VITE_APP_API_URL || 'http://localhost:3001/api';

export type UserRole = 'citizen' | 'admin' | 'resolver';

export interface User {
  uid: string;
  address: string;
  fullName: string;
  email: string;
  phone: string;
  nationalId: string;
  role: UserRole;
  pubKey?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (address: string) => Promise<void>;
  logout: () => void;
  register: (userData: Omit<User, 'uid'>) => Promise<void>;
  updateProfile: (userId: string, data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { account } = useWeb3();

  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Update authorization header when account changes
  api.interceptors.request.use((config) => {
    if (account) {
      config.headers['Authorization'] = `Bearer ${account}`;
    }
    return config;
  });

  // Check auth status when account changes
  useEffect(() => {
    const checkAuth = async () => {
      if (account) {
        try {
          const response = await api.get(`/users/by-address/${account}`);
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          setUser(null);
          setIsAuthenticated(false);
        } finally {
          setIsLoading(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [account]);

  const login = async (address: string) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/users/by-address/${address}`);
      setUser(response.data);
      setIsAuthenticated(true);
      toast.success('Logged in successfully');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    toast.info('Logged out successfully');
  };

  const register = async (userData: Omit<User, 'uid'>) => {
    try {
      setIsLoading(true);
      const response = await api.post('/users', userData);
      setUser(response.data);
      setIsAuthenticated(true);
      toast.success('Registration successful');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userId: string, data: Partial<User>) => {
    try {
      setIsLoading(true);
      const response = await api.patch(`/users/${userId}`, data);
      setUser(response.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Profile update failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      register,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};