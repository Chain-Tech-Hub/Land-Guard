# LandGuard by Chain Tech Hub

## Overview
LandGuard is an open-source blockchain solution for secure land registry and property management.

## Project Structure
```
trustchain/
├── contracts/           # Smart contracts
│   ├── Land.sol
│   └── Registry.sol
├── ignition/
│   └── modules/        # Deployment modules
│       └── land.js
├── test/               # Test files
├── scripts/            # Deployment scripts
├── hardhat.config.js   # Hardhat configuration
└── index.js           # Main application entry
```

## Features
- Land title registration and verification
- Property ownership transfer management
- Historical transaction tracking
- Digital property documentation
- Smart contract-based ownership proof

## Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Hardhat
- MetaMask or similar Web3 wallet

## Installation
```shell
# Install dependencies
npm install 

# Start local blockchain
npx hardhat node

# Compile smart contracts
npx hardhat compile

# Deploy contracts
node "./ignition/modules/land.js" --network localhost

# Start application
node index.js
```

## Testing
```shell
npx hardhat test
```

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact
Chain Tech Hub - hello@chaintechhub.com

## Acknowledgments
- Hardhat
- OpenZeppelin
- Ethereum Community