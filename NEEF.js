const express = require("express");
const bodyParser = require("body-parser");
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(bodyParser.json());

// Provider and Wallet Configuration
const RPC_URL = "http://127.0.0.1:8545";
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

const PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const adminWallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Load ABI and Contract Address
let contract;
let contractAddress;

try {
  const contractAbiPath = path.join(
    __dirname,
    "ignition",
    "deployed_contracts",
    "NEEFLoanContract_abi.json"
  );
  const contractAddressPath = path.join(
    __dirname,
    "ignition",
    "deployed_contracts",
    "NEEFLoanContract_address.json"
  );

  const contractAbi = JSON.parse(fs.readFileSync(contractAbiPath, "utf-8"));
  const contractAddressData = JSON.parse(
    fs.readFileSync(contractAddressPath, "utf-8")
  );

  contractAddress =
    typeof contractAddressData === "string"
      ? contractAddressData.trim()
      : contractAddressData.address;
  contract = new ethers.Contract(contractAddress, contractAbi, adminWallet);

  console.log(`Parsed Contract Address: ${contractAddress}`);
} catch (err) {
  console.error(`Error loading contract data: ${err.message}`);
  process.exit(1);
}

// Routes
app.post("/create_loan", async (req, res) => {
  try {
    const { borrower, amount, loan_type, collateral_deed_id } = req.body;
    const tx = await contract.createLoan(
      borrower,
      ethers.utils.parseEther(amount.toString()),
      loan_type,
      collateral_deed_id
    );

    const receipt = await tx.wait();
    res.json({ status: "success", txHash: receipt.transactionHash });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.post("/disburse_loan/:loanId", async (req, res) => {
  try {
    const { loanId } = req.params;
    const tx = await contract.disburseLoan(parseInt(loanId));

    const receipt = await tx.wait();
    res.json({ status: "success", txHash: receipt.transactionHash });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.post("/repay_loan", async (req, res) => {
  try {
    const { loan_id, repayment_amount, private_key } = req.body;

    const borrowerWallet = new ethers.Wallet(private_key, provider);
    const borrowerContract = contract.connect(borrowerWallet);

    const tx = await borrowerContract.repayLoan(
      parseInt(loan_id),
      ethers.utils.parseEther(repayment_amount.toString())
    );

    const receipt = await tx.wait();
    res.json({ status: "success", txHash: receipt.transactionHash });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.get("/check_for_default/:loanId", async (req, res) => {
  try {
    const { loanId } = req.params;
    const result = await contract.checkForDefault(parseInt(loanId));

    res.json({ status: "checked", result });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.post("/reclaim_collateral/:loanId", async (req, res) => {
  try {
    const { loanId } = req.params;
    const { private_key } = req.body;

    const borrowerWallet = new ethers.Wallet(private_key, provider);
    const borrowerContract = contract.connect(borrowerWallet);

    const tx = await borrowerContract.reclaimCollateral(parseInt(loanId));

    const receipt = await tx.wait();
    res.json({ status: "success", txHash: receipt.transactionHash });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.get("/get_loans/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const loans = await contract.getLoansByBorrower(address);

    res.json({ loans });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
