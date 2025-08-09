// src/components/GoogleSignIn.jsx
import React, { useEffect } from 'react';

export default function GoogleSignIn({ onIdToken }) {
  useEffect(() => {
    // Wait for Google SDK to load
    window.google?.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: (response) => {
        onIdToken(response.credential);
      },
    });

    window.google?.accounts.id.renderButton(
      document.getElementById('google-signin'),
      {
        theme: 'outline',
        size: 'large',
      }
    );
  }, [onIdToken]);

  return <div id="google-signin"></div>;
}
