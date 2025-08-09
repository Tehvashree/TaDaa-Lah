import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      width: '100%',
      background: '#F5F5F5',
      boxShadow: '0 -1px 5px rgba(0, 0, 0, 0.05)',
      padding: '20px 0',
      textAlign: 'center',
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      color: '#555',
      position: 'relative'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 16px'
      }}>
        © 2025 TaDaa-Lah. All rights reserved.
      </div>
    </footer>
  );
}
