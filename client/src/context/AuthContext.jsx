import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We now just check user session directly, no token in layout
    const checkSession = async () => {
      try {
        const { data } = await authAPI.getMe();
        if (data.success) {
          setUser(data.data.user);
          localStorage.setItem('msrcasc_user', JSON.stringify(data.data.user)); // Just UI cache
        }
      } catch (error) {
        localStorage.removeItem('msrcasc_user');
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await authAPI.login({ email, password });
      if (data.success) {
        localStorage.setItem('msrcasc_user', JSON.stringify(data.data.user));
        setUser(data.data.user);
      }
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to login';
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const { data } = await authAPI.register({ name, email, password, role });
      if (data.success) {
        localStorage.setItem('msrcasc_user', JSON.stringify(data.data.user));
        setUser(data.data.user);
      }
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to register';
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('msrcasc_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
