# LandGuard Frontend

A modern, Web3-integrated frontend for the LandGuard decentralized land registry system built with React, TypeScript, and Tailwind CSS.

## Features

### 🔗 Web3 Integration
- **MetaMask Connection**: Seamless wallet connection and management
- **Smart Contract Interaction**: Direct interaction with LandToken and LandRegistry contracts
- **Real-time Blockchain Data**: Live updates from blockchain events
- **Multi-network Support**: Configurable for different blockchain networks

### 🏠 Land Management
- **Land Registration**: Create and register new land parcels
- **Title Deed Minting**: Generate blockchain-verified title deeds
- **Marketplace**: Buy and sell land parcels with ETH
- **Dispute Resolution**: Flag and resolve ownership conflicts

### 👥 Role-based Dashboards
- **Citizen Dashboard**: Manage personal land holdings and transactions
- **Admin Dashboard**: System administration and land layout management
- **Resolver Dashboard**: Dispute resolution and conflict management
- **Public Verification**: Public portal for land ownership verification

### 🔒 Security & Verification
- **Blockchain Verification**: All transactions verified on-chain
- **IPFS Integration**: Decentralized document storage
- **Role-based Access Control**: Different permissions for different user types
- **Dispute Management**: Comprehensive conflict resolution system

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with custom styling
- **Web3 Integration**: Ethers.js v6
- **State Management**: React Context API
- **Routing**: React Router v6
- **Form Handling**: React Hook Form with Zod validation
- **Notifications**: Sonner toast notifications
- **Build Tool**: Vite

## Prerequisites

- Node.js 18+ and npm/yarn
- MetaMask browser extension
- Running Hardhat local network (for development)
- Deployed smart contracts (LandToken and LandRegistry)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Land-Guard/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   
   Update the contract addresses in `src/contexts/Web3Context.tsx`:
   ```typescript
   const CONTRACTS = {
     LAND_TOKEN: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Your deployed LandToken address
     LAND_REGISTRY: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', // Your deployed LandRegistry address
   };
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## Smart Contract Setup

Before using the frontend, ensure your smart contracts are deployed:

1. **Start Hardhat Network**
   ```bash
   cd ../smartcontract
   npx hardhat node
   ```

2. **Deploy Contracts**
   ```bash
   npx hardhat ignition deploy ./ignition/modules/LandToken.js --network localhost
   ```

3. **Update Contract Addresses**
   Copy the deployed addresses to the frontend configuration.

## MetaMask Configuration

1. **Add Hardhat Network to MetaMask**
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

2. **Import Test Accounts**
   Use the private keys from Hardhat's test accounts for development.

## Usage Guide

### For Citizens

1. **Connect Wallet**: Click "Connect MetaMask" to link your wallet
2. **Create Land Layout**: Use the "Create Land Layout" button to register new land
3. **Register Land**: Convert land layouts to registered parcels
4. **Mint Title Deeds**: Generate blockchain-verified ownership documents
5. **List for Sale**: Put your land on the marketplace
6. **Buy Land**: Purchase available land parcels

### For Administrators

1. **System Overview**: Monitor total lands, disputes, and system health
2. **Create Layouts**: Generate new land layouts for registration
3. **Grant Roles**: Assign administrative roles to other addresses
4. **System Control**: Pause/unpause contracts in emergencies

### For Resolvers

1. **View Disputes**: See all flagged land conflicts
2. **Review Evidence**: Analyze submitted dispute evidence
3. **Resolve Conflicts**: Make decisions on rightful ownership
4. **Track Resolutions**: Monitor completed dispute resolutions

### Public Verification

1. **Search by Land ID**: Enter numeric land ID to verify ownership
2. **View Details**: See owner, status, and blockchain verification
3. **Check Documents**: Verify IPFS-stored documentation
4. **Dispute Warnings**: See if land is under dispute

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (buttons, cards, etc.)
│   ├── DashboardLayout.tsx
│   └── Web3Connection.tsx
├── contexts/            # React contexts
│   ├── AuthContext.tsx  # Authentication state
│   └── Web3Context.tsx  # Web3 integration
├── contracts/           # Smart contract ABIs
│   ├── LandToken.json
│   └── LandRegistry.json
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── pages/               # Page components
│   ├── Index.tsx        # Landing page
│   ├── Login.tsx        # Authentication
│   ├── CitizenDashboard.tsx
│   ├── AdminDashboard.tsx
│   ├── ResolverDashboard.tsx
│   └── PublicVerification.tsx
└── main.tsx            # Application entry point
```

## Key Components

### Web3Context
Manages all blockchain interactions:
- Wallet connection/disconnection
- Contract instance management
- Transaction handling
- Event listening

### Dashboard Components
Role-specific interfaces:
- **CitizenDashboard**: Personal land management
- **AdminDashboard**: System administration
- **ResolverDashboard**: Dispute resolution

### Web3Connection
Handles wallet connection UI and network switching.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

Create a `.env` file for environment-specific configuration:

```env
VITE_LAND_TOKEN_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_LAND_REGISTRY_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
VITE_NETWORK_CHAIN_ID=31337
```

## Troubleshooting

### Common Issues

1. **MetaMask Connection Issues**
   - Ensure MetaMask is installed and unlocked
   - Check that you're on the correct network (Hardhat Local)
   - Refresh the page and try reconnecting

2. **Transaction Failures**
   - Verify you have sufficient ETH for gas fees
   - Check that contracts are deployed and addresses are correct
   - Ensure you have the required role permissions

3. **Contract Interaction Errors**
   - Verify contract addresses in Web3Context.tsx
   - Check that Hardhat network is running
   - Ensure ABIs are up to date

### Development Tips

1. **Testing with Multiple Accounts**
   - Import different Hardhat accounts to test various roles
   - Use different browsers or incognito mode for multiple sessions

2. **Debugging Transactions**
   - Check browser console for detailed error messages
   - Use Hardhat console logs for contract debugging
   - Monitor network tab for failed requests

3. **State Management**
   - Use React DevTools to inspect context state
   - Check that wallet connection persists across page refreshes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the smart contract documentation
3. Open an issue on GitHub

---

**Note**: This is a development version. For production deployment, ensure proper security audits and testing.