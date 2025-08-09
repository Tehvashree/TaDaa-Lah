import React, { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ZkLoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [error, setError] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Handle navigation when auth state changes
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  // Load Google script
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => setError('Failed to load Google script');
      document.head.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, []);

  // Initialize Google button
  useEffect(() => {
    if (!scriptLoaded) return;

    try {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_ZKLOGIN_CLIENT_ID,
        callback: handleCredentialResponse,
        ux_mode: 'popup',
        context: 'signin'
      });

      const buttonContainer = document.getElementById('zklogin-button');
      if (buttonContainer) {
        window.google.accounts.id.renderButton(buttonContainer, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular'
        });
      }
    } catch (err) {
      console.error('Google init error:', err);
      setError('Failed to initialize Google Sign-In');
    }
  }, [scriptLoaded]);

  const handleCredentialResponse = async (response) => {
    setIsLoggingIn(true);
    try {
      const idToken = response.credential;
      if (!idToken) throw new Error('No ID token received');

      const userInfo = {
        name: response.payload?.name || 'Google User',
        email: response.payload?.email || '',
        picture: response.payload?.picture || ''
      };

      const success = await login({ token: idToken }, userInfo);
      if (!success) throw new Error('Login failed');
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isLoading) {
    return <div style={styles.loading}>Loading authentication...</div>;
  }

  if (isAuthenticated()) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div style={styles.page}>
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/26de038695ba81719ed45aabf48364caa94eda0e?width=2116"
        style={styles.vector}
        alt="Background"
      />
      <div style={styles.content}>
        <h1 style={styles.title}>Welcome to TaDaa-Lah</h1>
        <p style={styles.subtitle}>Login securely with Google</p>
        <div 
          id="zklogin-button" 
          style={{
            ...styles.buttonContainer,
            opacity: isLoggingIn ? 0.7 : 1,
            pointerEvents: isLoggingIn ? 'none' : 'auto'
          }}
        />
        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

const styles = {
  page: {
    width: '100%',
    minHeight: '100vh',
    background: '#F9F9F9',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif'
  },
  vector: {
    width: '1058px',
    height: '1221px',
    transform: 'rotate(8.059deg)',
    position: 'absolute',
    left: '-495px',
    top: '-87px',
    zIndex: 0,
    opacity: 0.05
  },
  content: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#333'
  },
  subtitle: {
    fontSize: '1.2rem',
    marginBottom: '1.5rem',
    color: '#666'
  },
  buttonContainer: {
    margin: '1rem 0'
  },
  error: {
    color: '#D32F2F',
    marginTop: '1rem'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif'
  }
};