import React, { useState } from 'react';
import { useSignAndExecuteTransactionBlock } from '@mysten/wallet-kit';
import { buildGrantSellerBadgeTx } from '../lib/txHelpers';

const PACKAGE_ID = '0xYOUR_PACKAGE_ID';
const MODULE_NAME = 'ticket';
const FUNC_NAME = 'grant_seller_badge';

export default function AdminPage() {
  const [sellerAddress, setSellerAddress] = useState('');
  const [status, setStatus] = useState('');
  const { mutate: signAndExecute } = useSignAndExecuteTransactionBlock();

  const handleGrant = () => {
    const tx = buildGrantSellerBadgeTx(PACKAGE_ID, MODULE_NAME, FUNC_NAME, sellerAddress);
    signAndExecute(
      {
        transactionBlock: tx,
        options: { showInput: true, showEffects: true },
      },
      {
        onSuccess: (result) => {
          setStatus(`✅ Badge granted! Tx Digest: ${result.digest}`);
        },
        onError: (err) => {
          setStatus(`❌ Error: ${err.message}`);
        },
      }
    );
  };

  return (
    <div className="container">
      <h2>Grant Seller Badge (Admin)</h2>
      <input
        type="text"
        placeholder="Enter seller wallet address"
        value={sellerAddress}
        onChange={(e) => setSellerAddress(e.target.value)}
        style={{ padding: '0.5rem', width: '100%', marginBottom: '1rem' }}
      />
      <button onClick={handleGrant} style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px' }}>
        Grant Seller Badge
      </button>
      <p>{status}</p>
    </div>
  );
}
