import { TransactionBlock } from '@mysten/sui.js/transactions';

/**
 * Build a transaction to call `grant_seller_badge` on-chain
 * @param {string} packageId - Your Move package ID
 * @param {string} moduleName - Likely "ticket"
 * @param {string} functionName - "grant_seller_badge"
 * @param {string} sellerAddress - the wallet address to verify
 * @returns TransactionBlock
 */
export function buildGrantSellerBadgeTx(packageId, moduleName, functionName, sellerAddress) {
  const tx = new TransactionBlock();
  tx.moveCall({
    target: `${packageId}::${moduleName}::${functionName}`,
    arguments: [
      tx.pure.address('@0x8dc5596ec77296eda91193077a08a57928e6b586378bd8ed794305ee93bf142f'),
      tx.pure.address(sellerAddress),
    ],
  });
  return tx;
}
