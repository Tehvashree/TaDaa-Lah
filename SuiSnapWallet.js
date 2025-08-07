import React, { useState } from 'react';
import { metamaskSuiWallet } from '../utils/metamaskSuiWallet';

const SuiSnapWallet = () => {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState('');

  const connectWallet = async () => {
    try {
      const address = await metamaskSuiWallet.connect();
      setAccount(address);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>🎉 Sui Snap + MetaMask</h2>

      <button onClick={connectWallet}>
        Connect MetaMask Sui Snap
      </button>

      {account ? (
        <p>✅ Connected: {account}</p>
      ) : (
        <p>🕓 Not connected</p>
      )}

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
};

export default SuiSnapWallet;
