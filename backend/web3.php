<?php
require("vendor/autoload.php");
use Web3\Web3;
use Web3\Contracts\EthContract;
use Web3\Utils;
use Elliptic\EC;
use Web3\Providers\HttpProvider;
use Web3\Eth;
use Web3\Contract;


// Hardhat local node URL
$nodeUrl = 'http://127.0.0.1:8545';

// Connect to Hardhat local node
$web3 = new Web3($nodeUrl);


//$provider = new Web3(new HttpProvider('http://localhost:8545', $private_key));
// Load the contract address and ABI from JSON files
$contractAddressData = json_decode(file_get_contents('../../../../htdocs/hardhatNode/ignition/deployed_contracts/LandTitleDeed_address.json'), true);

$contractAddress = $contractAddressData['address'];


$contractAbi = json_decode(file_get_contents('../../../../htdocs/hardhatNode/ignition/deployed_contracts/LandTitleDeed_abi.json'), true);

// Public and private keys
$publicKey = '0xf38f2C9bCfa851e64F529d040edaE288fA361743'; 
$privateKey = 'ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; 


?>