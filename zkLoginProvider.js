import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { v4 as uuidv4 } from 'uuid';
import { fromByteArray } from 'base64-js';

ed.etc.sha512Sync = sha512;

const KEY_PAIR_EXPIRY_MS = 15 * 60 * 1000;

let cachedKey = null;
let cachedAt = 0;

async function generateKey() {
  const privateKey = ed.utils.randomPrivateKey();
  const publicKey = await ed.getPublicKey(privateKey);
  return {
    privateKey,
    publicKey,
    publicKeyBase64: fromByteArray(publicKey),
  };
}

export async function createEphemeralKeyPair() {
  if (cachedKey && Date.now() - cachedAt < KEY_PAIR_EXPIRY_MS) return cachedKey;
  cachedKey = await generateKey();
  cachedAt = Date.now();
  return cachedKey;
}

export async function createZkLoginSession(idToken) {
  if (!idToken || typeof idToken !== 'string') throw new Error('Missing ID token');
  const key = await createEphemeralKeyPair();
  return {
    sessionId: uuidv4(),
    provider: 'google',
    idToken,
    nonce: uuidv4(),
    ephemeralKey: {
      private: key.privateKey,
      public: key.publicKey,
      publicBase64: key.publicKeyBase64,
    },
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + KEY_PAIR_EXPIRY_MS).toISOString(),
  };
}
