import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css'; // We will create this CSS file

export default function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      {/* Left - Logo */}
      <div className="navbar-logo">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/a6e92615e85252d7f7c1a5eb904a6aa79855d2e6?width=124"
          alt="Logo"
        />
      </div>

      {/* Center - Nav Links */}
      <div className="navbar-links">
        <Link to="/home">Home</Link>
        <Link to="/ticket">Event</Link>
        <Link to="/sell">Sell Ticket</Link>
        <Link to="/verify">QR Ticket Screen</Link>
      </div>

      {/* Right - Auth Buttons */}
      <div className="navbar-auth">
        <Link to="/profile" className="profile-button">Profile</Link>
      </div>
    </nav>
  );
}
