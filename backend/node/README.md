LandGuard Backend (Node + Express + Firebase + Ethers)

Setup
- Copy .env.example to .env and fill values
- Provide a Firebase service account JSON and set GOOGLE_APPLICATION_CREDENTIALS path
- Ensure RPC_URL and contract addresses are configured
- Install deps and run
  cd backend/node
  npm install
  npm run dev

Environment
- PORT: service port
- RPC_URL: EVM JSON-RPC endpoint
- CONTRACT_LAND_REGISTRY: deployed LandRegistry address
- CONTRACT_LAND_TOKEN: deployed LandToken address
- SYNC_FROM_BLOCK: optional start block for initial sync
- FIREBASE_PROJECT_ID: Firestore project ID (optional when using service account)
- GOOGLE_APPLICATION_CREDENTIALS: absolute path to service account JSON

API
- GET /health

Users
- POST /api/users
  body: { fullName,email,phone,nationalId,address,pubKey?,encPrivKey,role? }
- GET /api/users
- GET /api/users/:id
- GET /api/users/by-address/:address
- PATCH /api/users/:id
- DELETE /api/users/:id

Lands
- PUT /api/lands/:landId
  body: { owner, coords?, meta? }
- GET /api/lands/:landId

Sync
- POST /api/sync/run
  Syncs LandRegistry and LandToken events from last checkpoints to latest, stores events, and updates lands owner/listing meta.

Notes
- Never store raw private keys. encPrivKey must be encrypted on the client.
- Adjust event handling logic in src/routes/sync.js if contract events change.
