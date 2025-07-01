# ![Chain Tech Hub Logo](https://www.chaintechhub.com/assets/logo.png)  
# Land Guard

**Eliminating bad actors, creating a safe environment for all generations**  
*Restoring Trust, Fair Treatment, and Good Governance*

---

## Overview

**Land Guard** is an open-source, blockchain-powered platform developed by Chain Tech Hub to digitize and secure land ownership records. It transforms traditional land documents into tamper-proof, verifiable, and transferable digital assets using blockchain technology.

Our mission is to eliminate land fraud, disputes, and corruption by leveraging decentralized technology to create a transparent and secure land registry system that benefits everyone.

---

## Protocol Deployment

- **Network:** DFK Chain (Avalanche Subnet Testnet)
- **Smart Contract Explorer:**  
  [View on Avalanche Subnet Explorer](https://subnets-test.avax.network/defi-kingdoms/address/0x4E5446D1De4cd3c6A6a81D6F64d3E323D8c8ee6D)

---

## Project Structure

```
trustchain/
├── contracts/           # Smart contracts (ERC-1155, Registry)
│   ├── Land.sol
│   └── Registry.sol
├── ignition/
│   └── modules/         # Deployment modules
│       └── land.js
├── test/                # Test files (Mocha/Chai)
├── scripts/             # Deployment scripts
├── hardhat.config.js    # Hardhat configuration
└── index.js             # Main application entry
```

---

## Core Features

| Feature                | What it Means                                                                 |
|------------------------|-------------------------------------------------------------------------------|
| **Digital Land Tokens**| Every plot of land is a unique digital certificate (NFT, ERC-1155 standard).  |
| **Blockchain Security**| Records are immutable and tamper-proof.                                       |
| **Transferable Deeds** | Owners can securely transfer land digitally.                                  |
| **Public Explorer**    | Anyone can verify ownership via a public blockchain link.                     |
| **Audit-Ready**        | Full ownership history is visible for governments and stakeholders.           |

---

## How It Works

1. **Land Parcel Minting:**  
   Land admin creates a digital map of land with a unique `landCode` (coordinates) and IPFS URL for land layout image.
2. **Ownership Assignment:**  
   The record is assigned to the rightful owner.
3. **Title Deed Minting:**  
   Land owners mint an ERC-1155 token as a digital land title deed.
4. **Proof Creation:**  
   Ownership becomes visible on the blockchain explorer.
5. **Transfer:**  
   Owners can digitally sign and transfer assets to others.
6. **Permanent Record:**  
   Every change is recorded, timestamped, and publicly visible.

---

## Visual Workflow

| Traditional Land Process         | Land Guard Process                |
|----------------------------------|-----------------------------------|
| Manual deeds, paper storage      | Digital tokens on blockchain      |
| Manual checks                    | Automatic verification            |
| Risk of forgery/fraud            | Tamper-proof NFT record           |
| Slow verification                | Instant verification              |
| High administrative costs        | Reduced costs                     |

---

## Breakthrough Benefits

| Challenge                    | Land Guard Advantage                                         |
|------------------------------|-------------------------------------------------------------|
| Fake or duplicated titles    | Blockchain prevents double ownership or fake records         |
| Ownership disputes           | Transparent history of every land transaction               |
| Access to capital            | Secure digital deeds can be used for loans                  |
| Field-level governance       | Helps local leaders manage land transparently               |
| Corruption risks             | Immutable records eliminate tampering opportunities         |

---

## ERC-1155 Smart Contract Advantage

- Store multiple land parcels or document types in one contract
- Represent ownership, lease agreements, or custom rights together
- Allow batch transfers (useful for estate/community land projects)
- Reduce blockchain gas fees by combining token operations

**Example Use Case:**  
- Each person holds a token for their specific plot  
- Admin can update multiple records at once  
- Custom roles (e.g., farmer, builder) can be attached to the same land asset

---

## Land Guard Ecosystem

```
[Community / Farmer / Buyer]
           │
       Uses DApp
           │
   [Land NFT Minted] 
        │
 Blockchain Ledger (DFK Chain)
        │
View / Verify / Transfer / Finance
```

---

## Use Cases

- **Mrs. Grace Phiri – Regained Security:**  
  Lost her land due to forged documents. Land Guard restored her ownership and dignity.

- **Miss Ruth Banda – Fraud Prevention:**  
  Lost money buying land already sold to another. Land Guard could have prevented this by instant verification.

---

## Why Choose Land Guard?

- Empowers women and youth by protecting land rights
- Transparent, secure, and efficient land ownership system
- Aligns with SDG goals (reducing inequality, promoting justice)
- Scalable for land management worldwide

---

## For Blockchain Developers

- **Smart Contracts:**  
  Written in Solidity (ERC-1155, Registry pattern).  
  Modular and extensible for integration with any frontend (React, Vue, etc.) or backend (Node.js, Python, etc.).

- **Deployment:**  
  Easily deployable via Hardhat scripts.  
  See [`ignition/modules/land.js`](./ignition/modules/land.js) for deployment logic.

- **Integration:**  
  - **Frontend:**  
    Use Ethers.js or Web3.js to interact with contract methods (mint, transfer, verify).
  - **Backend:**  
    Listen to contract events for off-chain indexing or notifications.
  - **Explorer:**  
    All transactions and ownership records are visible on [DFK Chain Explorer](https://subnets-test.avax.network/defi-kingdoms/address/0x4E5446D1De4cd3c6A6a81D6F64d3E323D8c8ee6D).

- **Testing:**  
  Comprehensive test suite in `/test` using Mocha/Chai.

- **Extensibility:**  
  Add new asset types, roles, or workflows by extending the ERC-1155 contract.

---

## Get Started

### Prerequisites

- Node.js (v14+)
- npm (v6+)
- Hardhat
- MetaMask or compatible Web3 wallet

### Installation

```shell
npm install 
npx hardhat node
npx hardhat compile
node "./ignition/modules/land.js" --network localhost
node index.js
```

### Testing

```shell
npx hardhat test
```

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Contact

Chain Tech Hub - hello@chaintechhub.com

---

## Acknowledgments

- Hardhat
- OpenZeppelin
- Ethereum Community

---

© 2025 Chain Tech Hub. All rights reserved.  
*Transforming