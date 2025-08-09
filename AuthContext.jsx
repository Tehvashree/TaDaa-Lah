import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = () => {
    setIsLoading(true);
    try {
      const storedSession = localStorage.getItem('zklogin_session');
      const storedUser = localStorage.getItem('zklogin_user');
      
      if (!storedSession || !storedUser) {
        clearAuth();
        return;
      }

      const session = JSON.parse(storedSession);
      const userData = JSON.parse(storedUser);
      
      // Validate session structure
      if (!session || typeof session !== 'object' || !session.expiresAt) {
        throw new Error('Invalid session format');
      }

      // Check if session is still valid
      if (new Date() < new Date(session.expiresAt)) {
        setUser({
          ...userData,
          session: session
        });
      } else {
        clearAuth();
      }
    } catch (error) {
      console.error('Error checking session:', error);
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (session, userInfo) => {
    try {
      if (!session?.token || !userInfo) {
        throw new Error('Invalid login data');
      }

      // Store session with proper expiration
      const sessionWithExpiry = {
        ...session,
        expiresAt: new Date(Date.now() + 1800 * 1000).toISOString() // 0.5 hour
      };

      localStorage.setItem('zklogin_session', JSON.stringify(sessionWithExpiry));
      localStorage.setItem('zklogin_user', JSON.stringify(userInfo));
      
      setUser({
        ...userInfo,
        session: sessionWithExpiry
      });
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      clearAuth();
      return false;
    }
  };

  const logout = () => {
    clearAuth();
  };

  const clearAuth = () => {
    try {
      localStorage.removeItem('zklogin_session');
      localStorage.removeItem('zklogin_user');
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
    setUser(null);
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      login,
      logout,
      checkExistingSession
    }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}