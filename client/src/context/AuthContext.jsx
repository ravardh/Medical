import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const adminToken = localStorage.getItem('adminToken');
    const adminInfo = localStorage.getItem('adminInfo');
    
    if (adminToken && adminInfo) {
      try {
        const userInfo = JSON.parse(adminInfo);
        setUser({
          token: adminToken,
          ...userInfo.user,
        });
      } catch (error) {
        console.error('Error parsing user info:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
      }
    }
    setLoading(false);

    // Listen for auto-logout events from API interceptor
    const handleAutoLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth-logout', handleAutoLogout);

    return () => {
      window.removeEventListener('auth-logout', handleAutoLogout);
    };
  }, []);

  const login = (token, userInfo) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminInfo', JSON.stringify(userInfo));
    setUser({
      token,
      ...userInfo.user,
    });
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
