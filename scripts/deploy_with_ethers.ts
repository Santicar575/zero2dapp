import { deploy } from "./ethers-lib";

/**
 * Deploy BuenoToken contract to Celo Sepolia
 *
 * Usage:
 * - Make sure you're connected to Celo Sepolia network in Remix
 * - Replace 'YOUR_DEPLOYER_ADDRESS' with your deployer address (will be set as owner)
 * - Run this script
 *
 * Example:
 * const ownerAddress = '0x1234567890123456789012345678901234567890'
 * await deploy('BuenoToken', [ownerAddress])
 */
(async () => {
  try {
    // Get the deployer address from the connected account
    const signer = new ethers.providers.Web3Provider(web3Provider).getSigner();
    const deployerAddress = await signer.getAddress();

    console.log(`Deploying BuenoToken with owner: ${deployerAddress}`);

    const result = await deploy("BuenoToken", [
      // Identity Verification Hub Celo Mainnet: 0xe57F4773bd9c9d8b6Cd70431117d353298B9f5BF
      // Identity Verification Hub Celo Sepolia: 0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74
      "0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74", // Identity Verification Hub
      "zero2dapp-verification", // Scope seed
      { olderThan: 18, forbiddenCountries: [], ofacEnabled: false } // Verification config
    ]);
    console.log(`✅ BuenoToken deployed successfully!`);
    console.log(`📝 Contract Address: ${result.address}`);
    console.log(`📝 Contract Address (lowercase): ${result.address.toLowerCase()}`);
    console.log(
      `🔗 Explorer: https://celo.blockscout.com/address/${result.address}`
    );
    console.log(`\n⚠️  Don't forget to:`);
    console.log(
      `   1. Update packages/subgraph/networks.json with the new address`
    );
    console.log(`   2. Update NEXT_PUBLIC_BUENO_TOKEN_ADDRESS in .env.local`);
    console.log(`   3. Update NEXT_PUBLIC_SELF_ENDPOINT in .env.local with: ${result.address.toLowerCase()}`);
  } catch (e) {
    console.error("❌ Deployment failed:", e.message);
  }
})();
