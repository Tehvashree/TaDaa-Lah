import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function BuyerPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    emailAddress: '',
    paymentSlip: null,
    showIdentity: false
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setFormData(prev => ({
      ...prev,
      paymentSlip: file
    }));
  };

  const handleBuyNow = () => {
    console.log('Purchase data:', formData);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F9F9F9' }}>
      <Navbar />

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '6rem 1rem 2rem',
      }}>
        <h1 style={{
          color: '#222',
          fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
          fontSize: '2.5rem',
          fontWeight: '700',
          marginBottom: '2rem'
        }}>
          Good to see you to have your ticket!!
        </h1>

        {/* Name */}
        <div style={fieldContainer}>
          <label style={labelStyle}>Name</label>
          <input
            type="text"
            placeholder="Type Here"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Contact + Email */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ ...fieldContainer, flex: '1 1 300px' }}>
            <label style={labelStyle}>Contact Number</label>
            <input
              type="tel"
              value={formData.contactNumber}
              onChange={(e) => handleInputChange('contactNumber', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ ...fieldContainer, flex: '1 1 300px' }}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              value={formData.emailAddress}
              onChange={(e) => handleInputChange('emailAddress', e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Payment Method */}
        <div style={{ marginTop: '2rem' }}>
          <label style={labelStyle}>Payment Method</label>
          <div style={{
            ...fieldContainer,
            width: '200px',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '1.25rem', fontWeight: '500' }}>SUI</span>
          </div>
        </div>

        {/* Upload Payment Slip */}
        <p style={{
          color: 'rgba(34, 34, 34, 0.50)',
          fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
          fontSize: '1rem',
          marginTop: '2rem'
        }}>
          Please upload your payment slip here
        </p>
        <div
          style={{ ...fieldContainer, cursor: 'pointer' }}
          onClick={() => document.getElementById('fileUpload').click()}
        >
          <span>
            {formData.paymentSlip ? formData.paymentSlip.name : 'Upload file'}
          </span>
          <input
            id="fileUpload"
            type="file"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            accept="image/*,.pdf"
          />
        </div>

        {/* Show Identity */}
        <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <input
            type="checkbox"
            id="showIdentity"
            checked={formData.showIdentity}
            onChange={(e) => handleInputChange('showIdentity', e.target.checked)}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
          <label htmlFor="showIdentity" style={labelStyle}>
            Show My Identity to Buyer
          </label>
        </div>

        {/* Buy Now - Centered */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleBuyNow}
            style={{
              marginTop: '2rem',
              padding: '1rem 2rem',
              borderRadius: '15px',
              background: '#DD4255',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <span style={{
              color: '#FFF',
              fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
              fontSize: '1.5rem',
              fontWeight: '700'
            }}>
              Buy Now
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

const fieldContainer = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  borderRadius: '15px',
  border: '1px solid #222',
  background: '#FFF',
  padding: '1rem',
  marginBottom: '1rem'
};

const labelStyle = {
  color: '#222',
  fontFamily: 'Inknut Antiqua, -apple-system, Roboto, Helvetica, sans-serif',
  fontSize: '1.25rem',
  fontWeight: '400',
  minWidth: '150px'
};

const inputStyle = {
  flex: 1,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: '#222',
  fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
  fontSize: '1rem'
};
