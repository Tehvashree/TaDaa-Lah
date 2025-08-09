import React from 'react'
import { ConnectButton, useWallet } from '@suiet/wallet-kit'
import './App.css'

function ConnectWallet() {
  const wallet = useWallet()

  console.log('Wallet status:', {
    connected: wallet.connected,
    connecting: wallet.connecting,
    account: wallet.account?.address
  })

  return (
    <div className="app">
      <header className="app-header">
        {/* This shows the wallet selector automatically */}
        <ConnectButton />
      </header>

      <main className="app-main">
        {wallet.connected && (
          <div className="wallet-info">
            <p><strong>Address:</strong> {wallet.account?.address}</p>
            <p><strong>Wallet:</strong> {wallet.name}</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default ConnectWallet