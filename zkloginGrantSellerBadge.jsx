// src/pages/GrantSellerPage.jsx
import React, { useState } from 'react';
import { grantSellerBadgeWithZkLogin } from '../lib/zkloginGrantSellerBadge';

export default function GrantSellerPage() {
  const [idToken, setIdToken] = useState('');
  const [salt, setSalt] = useState('');
  const [proof, setProof] = useState(null);
  const [status, setStatus] = useState('');

  const handleGrantBadge = async () => {
    if (!idToken || !salt || !proof) {
      setStatus('Please provide all fields (idToken, salt, proof).');
      return;
    }

    try {
      setStatus('Sending transaction...');
      const txDigest = await grantSellerBadgeWithZkLogin({ idToken, salt, proof });
      setStatus(`✅ Badge granted! Tx digest: ${txDigest}`);
    } catch (error) {
      console.error(error);
      setStatus(`❌ Transaction failed: ${error.message}`);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h2>Grant Seller Badge (zkLogin)</h2>

      <label>Google ID Token:</label>
      <textarea
        value={idToken}
        onChange={(e) => setIdToken(e.target.value)}
        rows={4}
        style={{ width: '100%', marginBottom: '1rem' }}
        placeholder="Paste JWT from Google Sign-In"
      />

      <label>Salt (hex):</label>
      <input
        type="text"
        value={salt}
        onChange={(e) => setSalt(e.target.value)}
        style={{ width: '100%', marginBottom: '1rem' }}
        placeholder="Enter salt (same used to generate zkAddress)"
      />

      <label>zkProof (JSON format):</label>
      <textarea
        value={proof ? JSON.stringify(proof, null, 2) : ''}
        onChange={(e) => {
          try {
            setProof(JSON.parse(e.target.value));
          } catch {
            setProof(null);
          }
        }}
        rows={6}
        style={{ width: '100%', marginBottom: '1rem' }}
        placeholder="Paste zkProof JSON here"
      />

      <button
        onClick={handleGrantBadge}
        style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Grant Badge
      </button>

      <div style={{ marginTop: '1rem' }}>{status}</div>
    </div>
  );
}