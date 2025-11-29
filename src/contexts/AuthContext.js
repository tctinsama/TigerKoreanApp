import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // Tạm thời set false để test UI

  useEffect(() => {
    // Tạm thời comment để test UI trước
    // checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await authService.isAuthenticated();
      if (isAuth) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Check auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    // Tạm thời giả lập login thành công cho demo UI
    setUser({
      id: 1,
      username: username,
      email: username + '@demo.com',
    });
    return { success: true };
    
    /* TODO: Kích hoạt khi có backend
    const result = await authService.login(username, password);
    if (result.success) {
      setUser(result.data.user);
    }
    return result;
    */
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
