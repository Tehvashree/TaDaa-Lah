import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../contexts/AuthContext';

export default function QRTicketScreen() {
  const { user } = useAuth();
  const [ticketData, setTicketData] = useState(null);
  const [refreshCounter, setRefreshCounter] = useState(20);

  // Simulate checking for purchased tickets
  useEffect(() => {
    // This would normally check user's purchased tickets from backend
    const userTickets = localStorage.getItem(`tickets_${user?.email}`);
    if (userTickets) {
      setTicketData(JSON.parse(userTickets));
    }
  }, [user]);

  // Countdown timer for QR code refresh
  useEffect(() => {
    if (ticketData && refreshCounter > 0) {
      const timer = setTimeout(() => {
        setRefreshCounter(refreshCounter - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (refreshCounter === 0) {
      setRefreshCounter(20); // Reset counter
    }
  }, [refreshCounter, ticketData]);

  const handleShowQRCode = () => {
    // Generate new QR code or show existing one
    setRefreshCounter(20);
  };

  if (!ticketData) {
    return (
      <div style={{
        width: '100%',
        minHeight: '100vh',
        background: '#F9F9F9',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif'
      }}>
        <h1 style={{
          color: '#222',
          textAlign: 'center',
          fontFamily: 'Inter',
          fontSize: '40px',
          fontWeight: '700',
          marginBottom: '20px'
        }}>
          Concert Ticket
        </h1>
        <div style={{
          color: '#222',
          textAlign: 'center',
          fontFamily: 'Inter',
          fontSize: '24px',
          fontWeight: '400'
        }}>
          No Ticket Available
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#F9F9F9',
      position: 'relative'
    }}>
      {/* Title */}
      <div style={{
        width: '293px',
        height: '48px',
        position: 'absolute',
        left: '343px',
        top: '134px'
      }}>
        <div style={{
          color: '#222',
          textAlign: 'center',
          fontFamily: 'Inter',
          fontSize: '40px',
          fontWeight: '700',
          lineHeight: 'normal',
          position: 'absolute',
          left: '0px',
          top: '0px',
          width: '293px',
          height: '48px'
        }}>
          Concert Ticket
        </div>
      </div>

      {/* Main Ticket Container */}
      <div style={{
        width: '754px',
        height: '395px',
        borderRadius: '15px',
        border: '1px solid #222',
        background: '#FFF',
        position: 'absolute',
        left: '343px',
        top: '197px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* QR Code */}
        <div style={{
          width: '270px',
          height: '270px',
          position: 'absolute',
          left: '242px',
          top: '35px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        <QRCodeSVG 
          value={`ticket-${ticketData.id || 'demo'}-${Date.now()}`}
          size={270}
          style={{
            width: '270px',
            height: '270px'
          }}
        />
        </div>

        {/* Refresh Text */}
        <div style={{
          width: '193px',
          height: '24px',
          position: 'absolute',
          left: '280px',
          top: '336px'
        }}>
          <div style={{
            color: '#222',
            textAlign: 'center',
            fontFamily: 'Inria Sans',
            fontSize: '20px',
            fontWeight: '700',
            lineHeight: 'normal',
            position: 'absolute',
            left: '0px',
            top: '0px',
            width: '193px',
            height: '24px'
          }}>
            Refresh in {refreshCounter} seconds
          </div>
        </div>

        {/* Overlay for design effect */}
        <div style={{
          width: '754px',
          height: '395px',
          borderRadius: '15px',
          border: '1px solid rgba(34, 34, 34, 0.00)',
          background: 'rgba(255, 255, 255, 0.77)',
          position: 'absolute',
          left: '0px',
          top: '0px',
          pointerEvents: 'none'
        }}></div>
      </div>

      {/* Show QR CODE Button */}
      <div style={{
        display: 'flex',
        width: '754px',
        height: '60px',
        padding: '15px 30px',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px',
        borderRadius: '15px',
        background: '#DD4255',
        position: 'absolute',
        left: '343px',
        top: '643px',
        cursor: 'pointer'
      }} onClick={handleShowQRCode}>
        <div style={{
          width: '271px',
          height: '44px',
          position: 'relative'
        }}>
          <div style={{
            color: '#FFF',
            fontFamily: 'Inter',
            fontSize: '36px',
            fontWeight: '700',
            lineHeight: 'normal',
            position: 'absolute',
            left: '0px',
            top: '0px',
            width: '271px',
            height: '44px',
            textAlign: 'center'
          }}>
            Show QR CODE
          </div>
        </div>
      </div>
    </div>
  );
}