import React, { useState, useEffect } from 'react';
import { genAddressSeed, jwtToAddress, getZkLoginSignature } from '@mysten/zklogin';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { JsonRpcProvider } from '@mysten/sui.js/rpc';
import { TransactionBlock } from '@mysten/sui.js/transactions';

const ZKLOGIN_DEVNET_PROVIDER = new JsonRpcProvider('https://fullnode.devnet.sui.io:443');
const ADMIN_ADDRESS = '0x8dc5596ec77296eda91193077a08a57928e6b586378bd8ed794305ee93bf142f';
const PACKAGE_ID = '0xd0fbe18753601de0ad3de8afc237fce5ae12ecadc3dbd1f2757afe0ef3ad14e7';

export default function GrantSeller() {
  const [idToken, setIdToken] = useState('');
  const [salt, setSalt] = useState('0xa1b2c3d4e5f6gurb7v7v890w023947wmmzoqirr'); // Use a secure random salt in real use
  const [digest, setDigest] = useState(null);

  useEffect(() => {
    // Load Google Sign-In button
    window.google?.accounts.id.initialize({
      client_id: '271588267527-2eood7jhapaetj4uvh8fm4og7dnheiik.apps.googleusercontent.com', // Replace with yours
      callback: (response) => {
        setIdToken(response.credential);
      },
    });

    window.google?.accounts.id.renderButton(
      document.getElementById('g_id_signin'),
      { theme: 'outline', size: 'large' }
    );
  }, []);

  async function handleGrant() {
    if (!idToken) return alert('Login with Google first');

    const jwtPayload = JSON.parse(atob(idToken.split('.')[1]));
    const iss = jwtPayload.iss;
    const sub = jwtPayload.sub;

    const zkAddress = jwtToAddress(genAddressSeed(salt, iss, sub));
    const ephemeralKeyPair = new Ed25519Keypair();

    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${PACKAGE_ID}::ticket::grant_seller_badge`,
      arguments: [
        tx.pure(ADMIN_ADDRESS),  // admin
        tx.pure(zkAddress),      // seller address
      ],
    });

    const userSignature = await ephemeralKeyPair.sign(tx.serialize());

    const zkSignature = getZkLoginSignature({
      inputs: {
        maxEpoch: 1000000000,
        ephemeralPublicKey: ephemeralKeyPair.getPublicKey(),
        userSignature,
        salt,
        zkProof: {
          // Simulated for now
          inputs: {},
          proof: [],
          maxEpoch: 1000000000,
          authData: {
            iss,
            sub,
            aud: 'YOUR_GOOGLE_CLIENT_ID',
          },
        },
      },
      address: zkAddress,
    });

    const result = await ZKLOGIN_DEVNET_PROVIDER.executeTransactionBlock({
      transactionBlock: tx,
      signature: zkSignature,
    });

    setDigest(result.digest);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Grant Seller Badge via zkLogin</h2>
      <div id="g_id_signin"></div>

      {idToken && (
        <>
          <p><strong>ID Token:</strong> {idToken.slice(0, 40)}...</p>
          <button onClick={handleGrant} style={{ padding: '10px 20px', marginTop: '1rem' }}>
            Grant Seller Badge
          </button>
        </>
      )}

      {digest && (
        <p><strong>Tx Digest:</strong> {digest}</p>
      )}
    </div>
  );
}
