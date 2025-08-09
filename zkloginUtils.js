import {
  genAddressSeed,
  genZkLoginSignature,
  getZkLoginSignature,
} from '@mysten/zklogin';
import { fromB64 } from '@mysten/sui.js/utils';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { jwtDecode } from 'jwt-decode';

// This should match what your Move module expects for salt
const ISSUER = 'https://accounts.google.com';
const MAX_EPOCH = 100000; // For devnet, safe high value

/**
 * Create an ephemeral keypair to sign transactions temporarily.
 */
export function createEphemeralKeyPair() {
  return Ed25519Keypair.generate();
}

/**
 * Generate zkLogin address and signature
 */
export async function buildZkLoginSignature({ idToken, ephemeralKeyPair }) {
  const jwtPayload = jwtDecode(idToken);
  const userSalt = 'user-defined-or-server-issued-salt'; // You may fetch this from a backend if needed
  const ephemeralPublicKey = ephemeralKeyPair.getPublicKey();

  const addressSeed = genAddressSeed(
    userSalt,
    ISSUER,
    jwtPayload.sub,
    ephemeralPublicKey
  );

  const zkLoginAddress = getZkLoginSignature(addressSeed); // This returns the derived zkLogin address

  const signature = await genZkLoginSignature({
    jwt: idToken,
    salt: userSalt,
    maxEpoch: MAX_EPOCH,
    ephemeralPrivateKey: ephemeralKeyPair.getSecretKey(),
    issuer: ISSUER,
    userAddress: zkLoginAddress,
  });

  return {
    zkLoginAddress,
    zkLoginSignature: signature,
  };
}
