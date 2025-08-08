// testSetup.js
import { runTestnetSetup } from '../src/utils/sui.js';

(async () => {
  try {
    console.log('🔍 Running Sui Testnet setup checklist...\n');
    await runTestnetSetup();
    console.log('\n✅ Setup test completed successfully!');
  } catch (error) {
    console.error('\n❌ Error during test setup:', error);
  }
})();
