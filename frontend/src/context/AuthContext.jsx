import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { getToken, setToken, removeToken, setUser, getUser } from '../utils/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const token = getToken();
      if (token) {
        try {
          const response = await authService.getProfile();
          if (response.success) {
            setUserState(response.data);
            setUser(response.data);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Failed to load user:', error);
          removeToken();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      if (response.success) {
        setToken(response.data.token);
        setUserState(response.data.user);
        setUser(response.data.user);
        setIsAuthenticated(true);
        toast.success('Login successful! 🎉');
        return { success: true };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response.success) {
        setToken(response.data.token);
        setUserState(response.data.user);
        setUser(response.data.user);
        setIsAuthenticated(true);
        toast.success('Registration successful! 🎉');
        return { success: true };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken();
      setUserState(null);
      setIsAuthenticated(false);
      toast.success('Logged out');
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    setUser: setUserState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};