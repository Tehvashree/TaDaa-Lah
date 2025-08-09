import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWallet, ConnectButton } from '@suiet/wallet-kit';

export default function Profile() {
  const { user } = useAuth();
  const { connected, account, disconnect } = useWallet();
  const [sellerData, setSellerData] = useState({
    name: '',
    isVerified: false,
    verificationDate: null,
  });
  const [loading, setLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [confirmationNumber, setConfirmationNumber] = useState('');

  // Load seller data from localStorage on mount
  useEffect(() => {
    if (user?.email) {
      const saved = localStorage.getItem(`seller_${user.email}`);
      if (saved) {
        setSellerData(JSON.parse(saved));
      }
    }
  }, [user]);

  const handleVerify = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const updatedSellerData = {
        ...sellerData,
        isVerified: true,
        verificationDate: new Date().toISOString(),
      };
      setSellerData(updatedSellerData);
      localStorage.setItem(`seller_${user.email}`, JSON.stringify(updatedSellerData));
      setLoading(false);
      setUploadFile(null);
      setConfirmationNumber('');
    }, 2000);
  };

  const handleNameUpdate = (name) => {
    const updatedData = { ...sellerData, name };
    setSellerData(updatedData);
    localStorage.setItem(`seller_${user.email}`, JSON.stringify(updatedData));
  };

  if (!user) {
    return (
      <div style={{
        width: '100%',
        minHeight: '100vh',
        background: '#F9F9F9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#F9F9F9',
      paddingTop: '80px',
      fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{
          color: '#222',
          textAlign: 'center',
          fontSize: '40px',
          fontWeight: '700',
          marginBottom: '40px',
        }}>
          Profile
        </h1>

        <div style={{
          background: '#FFF',
          borderRadius: '15px',
          border: '1px solid #222',
          padding: '40px',
          marginBottom: '30px',
        }}>
          {/* User Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '30px',
            marginBottom: '40px',
            borderBottom: '1px solid #E0E0E0',
            paddingBottom: '30px',
          }}>
            <img
              src={user.picture || '/api/placeholder/100/100'}
              alt="Profile"
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                border: '3px solid #DD4255',
              }}
            />
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 10px 0', color: '#222' }}>
                {user.name}
              </h2>
              <p style={{ fontSize: '16px', color: '#666', margin: '0 0 10px 0' }}>
                {user.email}
              </p>
              {sellerData.isVerified && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#E8F5E8',
                  color: '#2E7D32',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                }}>
                  ✅ Verified Seller
                </div>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '30px',
            marginBottom: '40px',
          }}>
            {/* Seller Info */}
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#222' }}>
                Seller Information
              </h3>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#222',
                }}>
                  Seller Name
                </label>
                <input
                  type="text"
                  value={sellerData.name}
                  onChange={(e) => handleNameUpdate(e.target.value)}
                  placeholder="Enter your seller name"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #222',
                    borderRadius: '8px',
                    fontSize: '16px',
                  }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#222',
                }}>
                  Login Time
                </label>
                <div style={{
                  padding: '12px',
                  background: '#F5F5F5',
                  borderRadius: '8px',
                  fontSize: '16px',
                  color: '#666',
                }}>
                  {user.loginTime ? new Date(user.loginTime).toLocaleString() : 'Not available'}
                </div>
              </div>
            </div>

            {/* Wallet Info */}
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#222' }}>
                Wallet Information
              </h3>

              {connected ? (
                <>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: '#222',
                    }}>
                      SUI Wallet Address
                    </label>
                    <div style={{
                      padding: '12px',
                      background: '#E8F5E8',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#2E7D32',
                      wordBreak: 'break-all',
                      border: '1px solid #4CAF50',
                    }}>
                      ✅ {account?.address}
                    </div>
                  </div>

                  <button
                    onClick={disconnect}
                    style={{
                      padding: '10px 20px',
                      background: '#F44336',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      marginBottom: '20px',
                    }}
                  >
                    Disconnect Wallet
                  </button>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: '#222',
                    }}>
                      SUI Wallet Status
                    </label>
                    <div style={{
                      padding: '12px',
                      background: '#FFF3E0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#F57C00',
                      border: '1px solid #FF9800',
                    }}>
                      ⚠️ Wallet not connected
                    </div>
                  </div>

                  <ConnectButton
                    style={{
                      background: '#DD4255',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  />
                </>
              )}

              {sellerData.isVerified && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#222',
                  }}>
                    Verification Date
                  </label>
                  <div style={{
                    padding: '12px',
                    background: '#E8F5E8',
                    borderRadius: '8px',
                    fontSize: '16px',
                    color: '#2E7D32',
                  }}>
                    {sellerData.verificationDate
                      ? new Date(sellerData.verificationDate).toLocaleDateString()
                      : 'N/A'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Verification Form */}
          {!sellerData.isVerified && (
            <div style={{ borderTop: '1px solid #E0E0E0', paddingTop: '30px' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '20px',
                color: '#222',
              }}>
                Become a Verified Seller
              </h3>
              <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>
                Upload your ticket and enter your confirmation number to get verified.
              </p>

              <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#222',
                  }}>
                    Upload Ticket
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #222',
                      borderRadius: '8px',
                      fontSize: '16px',
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#222',
                  }}>
                    Confirmation Number
                  </label>
                  <input
                    type="text"
                    value={confirmationNumber}
                    onChange={(e) => setConfirmationNumber(e.target.value)}
                    placeholder="Enter confirmation number"
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #222',
                      borderRadius: '8px',
                      fontSize: '16px',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: '50px',
                    background: '#DD4255',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '18px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? 'Verifying...' : 'Verify My Ticket'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}