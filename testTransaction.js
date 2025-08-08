import { executeTestTransaction } from './utils/sui.js';

(async () => {
  console.log("🚀 Sending transaction to Sui testnet...");
  const result = await executeTestTransaction();
  console.log("✅ Transaction complete:", result);
})();
