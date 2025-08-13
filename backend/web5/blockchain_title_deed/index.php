<?php

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: *");

require '../../conn.php';
require("../../vendor/autoload.php");



use Web3\Web3;

// Connect to the Ethereum local node
$web3 = new Web3('http://127.0.0.1:8545');

// Generate a random string
$randomString = bin2hex(random_bytes(16)); // Generates a 32-character random string

$txHashData = "0x";
// Use the sha3 method to hash the random string
$web3->sha3($randomString, function ($err, $hash) {
    if ($err !== null) {
        echo 'Error: ' . $err->getMessage() . PHP_EOL;
        return;
    }
$txHashData = $hash;
    // Output the hash
    echo 'Random String: ' . $randomString . PHP_EOL;
    echo 'Generated Hash: ' . $hash . PHP_EOL;
});


//$provider = new Web3(new HttpProvider('http://localhost:8545', $private_key));
// Load the contract address and ABI from JSON files
$contractAddressData = json_decode(file_get_contents('../../../../htdocs/hardhatNode/ignition/deployed_contracts/LandTitleDeed_address.json'), true);

$contractAddress = $contractAddressData['address'];


$contractAbi = json_decode(file_get_contents('../../../../htdocs/hardhatNode/ignition/deployed_contracts/LandTitleDeed_abi.json'), true);

// Public and private keys
$publicKey = '0xf38f2C9bCfa851e64F529d040edaE288fA361743'; 
$privateKey = 'ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';






$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $data = json_decode(file_get_contents('php://input'), true);

        // Fetch application details with LEFT JOIN on users and land tables
        $applicationId = (int)$_GET['application_id'];

 

        try {
            $stmt = $pdo->prepare("
                SELECT 
                    applications.id AS application_number,
                    users.id AS user_id,
                    users.full_name,
                    users.nation_id,
                    users.phone_number,
                    land.land_id AS land_code,
                    land.type AS land_type,
                    land.layout AS land_layout_url,
                    applications.application_date
                FROM applications
                LEFT JOIN users ON applications.user_id = users.id
                LEFT JOIN land ON applications.land_id = land.land_id
                WHERE applications.id = :application_id
            ");
            $stmt->execute([':application_id' => $applicationId]);
            $applicationData = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$applicationData) {
                throw new Exception("Application not found.");
            }

          
            

        $userId = $applicationData['user_id'];
        $transactionHash= $applicationData['nation_id'];
        $titleDeedName =$applicationData['full_name'];
        $landCode =$applicationData['land_code'];
        $ownerNationId= $applicationData['nation_id'];
        $ownerPhoneNumber =$applicationData['phone_number'];
        $landType = $applicationData['land_type'];
        $landLayoutUrl =  $applicationData['land_layout_url'];



//             // Create contract instance
//         $contract = new Contract($web3->provider, $contractAbi);

// // Get the current nonce for the account
//         $web3->eth->getTransactionCount($publicKey, 'latest', function ($err, $nonce) use (
//     $web3,
//     $contract,
//     $contractAddress,
//     $publicKey,
//     $privateKey,
//     $userId,
//         $transactionHash,
//         $titleDeedName,
//         $landCode,
//         $ownerNationId,
//         $ownerPhoneNumber,
//         $landType,
//         $landLayoutUrl
// ) {
//     if ($err !== null) {
//         echo "Error fetching nonce: " . $err->getMessage() . PHP_EOL;
//         return;
//     }

//     // Data payload for create_deed function
//     $data = $contract->at($contractAddress)->getData('mintTitleDeed', 
//         $userId,
//         $transactionHash,
//         $titleDeedName,
//         $landCode,
//         $ownerNationId,
//         $ownerPhoneNumber,
//         $landType,
//         $landLayoutUrl);

//     // Create a raw transaction
//     $transaction = [
//         'nonce' => '0x' . $nonce->toString(16),
//         'from' => $publicKey,
//         'to' => $contractAddress,
//         'gas' => '0x5208', // 21000 gas limit
//         'gasPrice' => '0x3B9ACA00', // 1 Gwei in wei
//         'value' => '0x0', // No Ether sent
//         'data' => $data,
//     ];

//     // Sign the transaction
//     // $ec = new EC('secp256k1');
//     // $key = $ec->keyFromPrivate($privateKey);
//     $tx = \Web3p\EthereumTx\Transaction::create($transaction);
//     $signedTx = $tx->sign($privateKey);

//     // Send the transaction
//     $web3->eth->sendRawTransaction('0x' . $signedTx, function ($err, $txHash) {
//         if ($err !== null) {
//             echo "Error sending transaction: " . $err->getMessage() . PHP_EOL;
//             return;
//         }

//         $transactionHash = $txHash;

//         echo "Transaction sent successfully. Hash: " . $txHash . PHP_EOL;

//         // Optional: Retrieve the transaction receipt
//         sleep(5); // Wait for the transaction to be mined
//         $web3->eth->getTransactionReceipt($txHash, function ($err, $receipt) {
//             if ($err !== null) {
//                 echo "Error fetching receipt: " . $err->getMessage() . PHP_EOL;
//                 return;
//             }

//             echo "Transaction Receipt: " . print_r($receipt, true) . PHP_EOL;
//         });
//     });
// });



            $transactionHash = bin2hex(random_bytes(16));
            $land_status = 0;
           

            $UpdateLandDetails = $pdo->prepare("UPDATE land SET owner_id =:owner_id, land_status=:land_status WHERE land_id=:land_id");

            // Insert data into title_deeds table
            $insertTitleDeedStmt = $pdo->prepare("
                INSERT INTO title_deeds (appllication_number, deed_number, approved, expiary_date, title_deed, type)
                VALUES (:application_number, :deed_number, :approved, :expiary_date, :title_deed, :type)
            ");


            $UpdateLandDetails->execute([
                'owner_id'=>$applicationData['user_id'],
                'land_status'=>$land_status,
                'land_id'=>$applicationData['land_code'],
            ]);

            $insertTitleDeedStmt->execute([
                ':application_number' => $applicationData['application_number'],
                ':deed_number' => $transactionHash,
                ':approved' => 1,
                ':expiary_date' => date('Y-m-d', strtotime('+99 years')),
                ':title_deed' => $applicationData['full_name'],
                ':type' => $applicationData['land_type'],
            ]);

            // Insert data into blockchain_transactions table
            $insertBlockchainStmt = $pdo->prepare("
                INSERT INTO blockchain_transactions (user_id, transaction_hash, title_deed_number, title_deed_name, land_code, owner_nation_id, owner_phone_number, land_type, land_layout_url)
                VALUES (:user_id, :transaction_hash, :title_deed_number, :title_deed_name, :land_code, :owner_nation_id, :owner_phone_number, :land_type, :land_layout_url)
            ");
            $insertBlockchainStmt->execute([
                ':user_id' => $applicationData['user_id'],
                ':transaction_hash' => $transactionHash,
                ':title_deed_number' => $transactionHash,
                ':title_deed_name' => $applicationData['full_name'],
                ':land_code' => $applicationData['land_code'],
                ':owner_nation_id' => $applicationData['nation_id'],
                ':owner_phone_number' => $applicationData['phone_number'],
                ':land_type' => $applicationData['land_type'],
                ':land_layout_url' => $applicationData['land_layout_url'],
            ]);

            echo json_encode([
                'message' => 'Title deed created successfully.',
                'transaction_hash' => $transactionHash,
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }

        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

?>
