import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import SellTicket from './pages/SellTicket';
import VerifyPage from './pages/VerifyPage';
import Profile from './pages/Profile';
import Event from './pages/Event';
import ZkLoginPage from './pages/ZkLoginPage';
import BuyerPage from './pages/BuyerPage';
import QRTicketScreen from './pages/QRTicketScreen';

// Import WalletProvider and its CSS from @suiet/wallet-kit
import { WalletProvider } from '@suiet/wallet-kit'; // Changed from @mysten/wallet-kit
import '@suiet/wallet-kit/style.css'; // This is the correct path for @suiet/wallet-kit styles

export default function App() {
  return (
    // Wrap the entire application with WalletProvider
    <WalletProvider>
      <AuthProvider>
        <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
          <Navbar />

          <main className="flex-grow w-full max-w-screen-2xl mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/zklogin" element={<ZkLoginPage />} />
              <Route
                path="/sell"
                element={
                  <ProtectedRoute>
                    <SellTicket />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/verify"
                element={
                  <ProtectedRoute>
                    <VerifyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ticket"
                element={
                  <ProtectedRoute>
                    <Event />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer"
                element={
                  <ProtectedRoute>
                    <BuyerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/qr-ticket"
                element={
                  <ProtectedRoute>
                    <QRTicketScreen />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </WalletProvider>
  );
}
