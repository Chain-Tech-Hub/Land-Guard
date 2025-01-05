const fs = require("fs");
const path = require("path");
const ethers = require("ethers");

// Replace with your local JSON-RPC endpoint
const LOCAL_RPC_URL = "http://127.0.0.1:8545"; // Update as needed
// Replace with the deployer's private key
const DEPLOYER_PRIVATE_KEY =
  "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

async function main() {
  console.log("Starting deployment script...");

  const outputDir = path.resolve(__dirname, "../deployed_contracts");
  const ensureDirExists = (dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  };
  ensureDirExists(outputDir);

  const provider = new ethers.providers.JsonRpcProvider(LOCAL_RPC_URL);
  const wallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);
  console.log("Deployer account address:", wallet.address);

  // Helper function to save contract data
  const saveContractData = (name, address, abi) => {
    fs.writeFileSync(
      path.join(outputDir, `${name}_address.json`),
      JSON.stringify({ address }, null, 2),
      "utf-8"
    );
    fs.writeFileSync(
      path.join(outputDir, `${name}_abi.json`),
      JSON.stringify(abi, null, 2),
      "utf-8"
    );
    console.log(`${name} deployed and data saved.`);
  };

  // Deploy LandTitleDeed
  console.log("Deploying LandTitleDeed...");
  const LandTitleDeedArtifact = require("../../artifacts/contracts/LandTitleDeed.sol/LandTitleDeed.json");
  const LandTitleDeedFactory = new ethers.ContractFactory(
    LandTitleDeedArtifact.abi,
    LandTitleDeedArtifact.bytecode,
    wallet
  );
  const landTitleDeed = await LandTitleDeedFactory.deploy();
  await landTitleDeed.deployTransaction.wait();
  saveContractData(
    "LandTitleDeed",
    landTitleDeed.address,
    LandTitleDeedArtifact.abi
  );

  // Deploy MalawiKwachaToken
  console.log("Deploying MalawiKwachaToken...");
  const MalawiKwachaTokenArtifact = require("../../artifacts/contracts/MalawiKwachaToken.sol/MalawiKwachaToken.json");
  const MalawiKwachaTokenFactory = new ethers.ContractFactory(
    MalawiKwachaTokenArtifact.abi,
    MalawiKwachaTokenArtifact.bytecode,
    wallet
  );
  const initialSupply = ethers.utils.parseEther("1000000"); // 1,000,000 MWK
  const malawiKwachaToken = await MalawiKwachaTokenFactory.deploy(initialSupply);
  await malawiKwachaToken.deployTransaction.wait();
  saveContractData(
    "MalawiKwachaToken",
    malawiKwachaToken.address,
    MalawiKwachaTokenArtifact.abi
  );

  // Deploy NEEFLoanContract
  console.log("Deploying NEEFLoanContract...");
  const NEEFLoanContractArtifact = require("../../artifacts/contracts/NEEFLoanContract.sol/NEEFLoanContract.json");
  const NEEFLoanContractFactory = new ethers.ContractFactory(
    NEEFLoanContractArtifact.abi,
    NEEFLoanContractArtifact.bytecode,
    wallet
  );
  const neefLoanContract = await NEEFLoanContractFactory.deploy(
    malawiKwachaToken.address,
    landTitleDeed.address
  );
  await neefLoanContract.deployTransaction.wait();
  saveContractData(
    "NEEFLoanContract",
    neefLoanContract.address,
    NEEFLoanContractArtifact.abi
  );

  console.log("All contracts deployed successfully!");
}

main()
  .then(() => {
    console.log("Script executed successfully, exiting...");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error during deployment:", error);
    process.exit(1);
  });
