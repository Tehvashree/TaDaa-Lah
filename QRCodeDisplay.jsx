import QRCode from 'qrcode.react';

export default function QRCodeDisplay({ ticketId }) {
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#F9F9F9',
      padding: '20px 80px',
      fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px'
      }}>
        <h1 style={{ fontSize: '40px', fontWeight: '700', margin: 0 }}>On Ticket Screen</h1>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span>Home</span>
          <span>Event</span>
          <span>Sell Ticket</span>
          <span>QR Ticket Screen</span>
          <span>Profile</span>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        maxWidth: '1280px', 
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h2 style={{ 
          fontSize: '40px', 
          fontWeight: '700', 
          margin: '0 0 20px 0'
        }}>
          Concert Ticket
        </h2>

        <p style={{ 
          fontSize: '20px',
          margin: '0 0 40px 0',
          color: 'rgba(34, 34, 34, 0.7)'
        }}>
          Refresh in 20 seconds
        </p>

        <div style={{
          height: '1px',
          width: '100%',
          background: '#222',
          margin: '0 0 40px 0'
        }}></div>

        {/* QR Code Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <QRCode 
            value={ticketId} 
            size={256} 
            style={{ 
              border: '15px solid white',
              borderRadius: '15px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
          />
          <h3 style={{ 
            fontSize: '24px', 
            fontWeight: '400',
            margin: 0
          }}>
            Show QR CODE
          </h3>
        </div>
      </div>
    </div>
  );
}