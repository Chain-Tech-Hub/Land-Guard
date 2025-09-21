const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

let provider;

function getProvider() {
  if (!provider) {
    const rpcUrl = process.env.RPC_URL;
    if (!rpcUrl) throw new Error('RPC_URL env not set');
    provider = new ethers.JsonRpcProvider(rpcUrl);
  }
  return provider;
}

function loadContract(name, address) {
  const abiJsonPathFront = path.resolve(__dirname, '../../../frontend/src/contracts', `${name}.json`);
  const abiJsonPathRoot = path.resolve(__dirname, '../../../smartcontract/artifacts/contracts', `${name}.sol/${name}.json`);

  let artifact;
  if (fs.existsSync(abiJsonPathFront)) {
    artifact = JSON.parse(fs.readFileSync(abiJsonPathFront, 'utf-8'));
  } else if (fs.existsSync(abiJsonPathRoot)) {
    artifact = JSON.parse(fs.readFileSync(abiJsonPathRoot, 'utf-8'));
  } else {
    throw new Error(`ABI for ${name} not found at ${abiJsonPathFront} or ${abiJsonPathRoot}`);
  }
  const abi = artifact.abi || artifact;
  const contract = new ethers.Contract(address, abi, getProvider());
  return contract;
}

async function getEvents(contract, eventName, fromBlock, toBlock) {
  const filter = contract.filters[eventName]();
  const logs = await contract.queryFilter(filter, fromBlock, toBlock);
  return logs.map(l => ({
    blockNumber: l.blockNumber,
    txHash: l.transactionHash,
    eventName: l.eventName,
    args: l.args?.map(a => (typeof a === 'bigint' ? a.toString() : a))
  }));
}

module.exports = { getProvider, loadContract, getEvents };
