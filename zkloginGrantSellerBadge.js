import {
  genAddressSeed,
  getZkLoginSignature,
  jwtToAddress
} from '@mysten/zklogin';

import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';

const ADMIN_ADDRESS = '0x8dc5596ec77296eda91193077a08a57928e6b586378bd8ed794305ee93bf142f';

const client = new SuiClient({ url: getFullnodeUrl("devnet") });

export async function grantSellerBadgeWithZkLogin({ idToken, salt, proof }) {
  const maxEpoch = 1000000000;

  // 1. Create ephemeral key
  const ephemeralKeyPair = new Ed25519Keypair();

  // 2. Parse JWT
  const jwtPayload = JSON.parse(atob(idToken.split('.')[1]));
  const iss = jwtPayload.iss;
  const sub = jwtPayload.sub;

  const zkAddress = jwtToAddress(genAddressSeed(salt, iss, sub));

  // 3. Create tx block
  const tx = new TransactionBlock();
  tx.moveCall({
    target: '0xd0fbe18753601de0ad3de8afc237fce5ae12ecadc3dbd1f2757afe0ef3ad14e7::ticket::grant_seller_badge',
    arguments: [
      tx.pure(ADMIN_ADDRESS),
      tx.pure(zkAddress)
    ],
  });

  // 4. zkLogin Signature
  const zkSignature = getZkLoginSignature({
    inputs: {
      maxEpoch,
      ephemeralPublicKey: ephemeralKeyPair.getPublicKey(),
      userSignature: await ephemeralKeyPair.sign(tx.serialize()),
      salt,
      zkProof: proof,
    },
    address: zkAddress,
  });

  // 5. Execute transaction
  const { digest } = await client.executeTransactionBlock({
    transactionBlock: tx,
    signature: zkSignature,
  });

  return digest;
}
