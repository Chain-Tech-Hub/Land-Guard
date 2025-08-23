#!/usr/bin/env node

/**
 * LandGuard Frontend Setup Script
 * 
 * This script helps set up the frontend with the correct contract addresses
 * and network configuration.
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function readDeployedAddresses() {
  const deploymentPath = path.join(__dirname, '../../smartcontract/ignition/deployments/chain-31337/deployed_addresses.json');
  
  try {
    if (fs.existsSync(deploymentPath)) {
      const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
      return {
        landToken: deploymentData['LandTokenModule#LandToken'],
        landRegistry: deploymentData['LandRegistryModule#LandRegistry'] || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
      };
    }
  } catch (error) {
    log(`Warning: Could not read deployment addresses: ${error.message}`, 'yellow');
  }
  
  return null;
}

function updateWeb3Context(addresses) {
  const web3ContextPath = path.join(__dirname, '../src/contexts/Web3Context.tsx');
  
  try {
    let content = fs.readFileSync(web3ContextPath, 'utf8');
    
    // Update contract addresses
    content = content.replace(
      /LAND_TOKEN: '[^']*'/,
      `LAND_TOKEN: '${addresses.landToken}'`
    );
    
    content = content.replace(
      /LAND_REGISTRY: '[^']*'/,
      `LAND_REGISTRY: '${addresses.landRegistry}'`
    );
    
    fs.writeFileSync(web3ContextPath, content);
    log('✅ Updated Web3Context.tsx with new contract addresses', 'green');
    
    return true;
  } catch (error) {
    log(`❌ Error updating Web3Context.tsx: ${error.message}`, 'red');
    return false;
  }
}

function createEnvFile(addresses) {
  const envPath = path.join(__dirname, '../.env');
  
  const envContent = `# LandGuard Frontend Environment Variables
VITE_LAND_TOKEN_ADDRESS=${addresses.landToken}
VITE_LAND_REGISTRY_ADDRESS=${addresses.landRegistry}
VITE_NETWORK_CHAIN_ID=31337
VITE_NETWORK_NAME=Hardhat Local
VITE_RPC_URL=http://127.0.0.1:8545
`;

  try {
    fs.writeFileSync(envPath, envContent);
    log('✅ Created .env file with contract addresses', 'green');
    return true;
  } catch (error) {
    log(`❌ Error creating .env file: ${error.message}`, 'red');
    return false;
  }
}

function checkDependencies() {
  const packageJsonPath = path.join(__dirname, '../package.json');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const requiredDeps = ['ethers', 'react', 'react-dom', 'vite'];
    
    const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
    
    if (missingDeps.length > 0) {
      log(`❌ Missing dependencies: ${missingDeps.join(', ')}`, 'red');
      log('Run: npm install', 'yellow');
      return false;
    }
    
    log('✅ All required dependencies are installed', 'green');
    return true;
  } catch (error) {
    log(`❌ Error checking dependencies: ${error.message}`, 'red');
    return false;
  }
}

function displaySetupInstructions() {
  log('\n📋 Setup Instructions:', 'cyan');
  log('1. Ensure Hardhat network is running:', 'blue');
  log('   cd ../smartcontract && npx hardhat node', 'bright');
  
  log('\n2. Deploy smart contracts:', 'blue');
  log('   npx hardhat ignition deploy ./ignition/modules/LandToken.js --network localhost', 'bright');
  
  log('\n3. Configure MetaMask:', 'blue');
  log('   - Network Name: Hardhat Local', 'bright');
  log('   - RPC URL: http://127.0.0.1:8545', 'bright');
  log('   - Chain ID: 31337', 'bright');
  log('   - Currency Symbol: ETH', 'bright');
  
  log('\n4. Start the frontend:', 'blue');
  log('   npm run dev', 'bright');
  
  log('\n5. Open browser:', 'blue');
  log('   http://localhost:5173', 'bright');
}

function main() {
  log('🚀 LandGuard Frontend Setup', 'magenta');
  log('================================\n', 'magenta');
  
  // Check dependencies
  if (!checkDependencies()) {
    process.exit(1);
  }
  
  // Read deployed contract addresses
  const addresses = readDeployedAddresses();
  
  if (addresses) {
    log(`📄 Found deployed contracts:`, 'cyan');
    log(`   LandToken: ${addresses.landToken}`, 'bright');
    log(`   LandRegistry: ${addresses.landRegistry}`, 'bright');
    
    // Update Web3Context
    updateWeb3Context(addresses);
    
    // Create .env file
    createEnvFile(addresses);
    
    log('\n✅ Frontend setup completed successfully!', 'green');
  } else {
    log('⚠️  No deployed contracts found. Using default addresses.', 'yellow');
    log('Please deploy contracts first and run this script again.', 'yellow');
  }
  
  displaySetupInstructions();
}

// Run the setup
main();