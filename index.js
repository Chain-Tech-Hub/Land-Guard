// Import dependencies
const express = require("express");
const { ethers } = require("ethers");
const mysql = require("mysql2/promise");

// Load environment variables
const CONTRACT_ADDRESS =
  require("./ignition/deployed_contracts/CitizenRegistry_address.json").address;
const PRIVATE_KEY =
  "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const INFURA_URL = "http://localhost:8545";

// Initialize Express app
const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());

//database connection 
//this will bw replaced by zero Knowledge proof
 const dbConfig = {
  host : "localhost"
 }

// Initialize Ethereum provider and signer
const provider = new ethers.providers.JsonRpcProvider(INFURA_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Load contract ABI (replace with your contract's ABI)
const abi = require("./ignition/deployed_contracts/CitizenRegistry_abi.json");

// Initialize contract instance
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);



// Route to register a citizen
app.post("/register", async (req, res) => {
  const { name, dateOfBirth, nationalID } = req.body;

  try {
    const tx = await contract.registerCitizen(name, nationalID);
    await tx.wait(); // Wait for the transaction to be mined
    res
      .status(200)
      .json({ message: "Citizen registered successfully", txHash: tx.hash });
await connection.execute("Ins")

  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to register citizen", details: error.message });
  }
});

// Route to verify a citizen (restricted to NRB)
app.post("/verify", async (req, res) => {
  const { citizenAddress } = req.body;

  try {
    const tx = await contract.verifyCitizen(citizenAddress);
    await tx.wait(); // Wait for the transaction to be mined
    res
      .status(200)
      .json({ message: "Citizen verified successfully", txHash: tx.hash });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to verify citizen", details: error.message });
  }
});

// Route to check if a citizen is verified
app.get("/isVerified/:address", async (req, res) => {
  const { address } = req.params;

  try {
    const isVerified = await contract.isCitizenVerified(address);
    res.status(200).json({ address, isVerified });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to check verification status",
      details: error.message,
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Citizen Registry API listening on http://localhost:${port}`);
});
