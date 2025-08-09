import { jwtToAddress } from '@mysten/zklogin';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { fromB64 } from '@mysten/bcs';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';


const client = new SuiClient({ url: getFullnodeUrl('devnet') });

export async function getZkLoginAddress(idToken) {
  // This assumes the token is a valid Google ID token (JWT)
  const payload = JSON.parse(atob(idToken.split('.')[1]));
  const provider = 'Google';

  const address = jwtToAddress({
    jwt: idToken,
    salt: 'replace-with-backend-generated-salt', // You must store this securely
    aud: payload.aud,
    sub: payload.sub,
    iss: 'https://accounts.google.com',
  });

  return address;
}
