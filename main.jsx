import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { WalletKitProvider } from '@mysten/wallet-kit';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { BrowserRouter } from 'react-router-dom';

const client = new SuiClient({
  url: getFullnodeUrl(import.meta.env.VITE_SUI_NETWORK || 'devnet'),
});

console.log('✅ ZK Client ID:', import.meta.env.VITE_ZKLOGIN_CLIENT_ID);

if (!import.meta.env.VITE_ZKLOGIN_CLIENT_ID) {
  console.error('❌ Missing VITE_ZKLOGIN_CLIENT_ID environment variable');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WalletKitProvider
      defaultNetwork="devnet"
      appInfo={{ name: 'TaDaa-Lah' }}
      client={client}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </WalletKitProvider>
  </React.StrictMode>
);
