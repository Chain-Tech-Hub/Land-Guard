<?php

require_once "../../conn.php";
require_once "../../web3.php";

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $applicationId = $_GET['applicationId']; // Fetch application ID from GET request
            
            // Fetch application details
            $stmt = $pdo->query("SELECT id, user_id, land_id FROM applications WHERE id = $applicationId");
            $applications = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($applications) {
                $applicationId = $applications['id'];
                $userId = $applications['user_id'];
                $landId = $applications['land_id'];
                
                // Fetch user and land details
                $userStmt = $pdo->prepare("SELECT full_name, nation_id, phone_number FROM users WHERE id = ?");
                $userStmt->execute([$userId]);
                $userDetails = $userStmt->fetch(PDO::FETCH_ASSOC);

                $landStmt = $pdo->prepare("SELECT type, land_id, layout FROM land WHERE land_id = ?");
                $landStmt->execute([$landId]);
                $landDetails = $landStmt->fetch(PDO::FETCH_ASSOC);

                if ($userDetails && $landDetails) {
                    $ownerNationId = $userDetails['nation_id'];
                    $ownerPhoneNumber = $userDetails['phone_number'];
                    $landCode = $landId;
                    $landLayoutUrl = $landDetails['layout'];
                    $titleDeedName = $userDetails['full_name'];
                    $landType = $landDetails['type'];
                    $transactionHash = "0x776869737065722d636861742d636c69656e74"; // Sample Transaction Hash

                    // Insert blockchain transaction details
                    $stmt = $pdo->prepare("INSERT INTO blockchain_transactions 
                    (user_id, transaction_hash, title_deed_number, title_deed_name, land_code, owner_nation_id, owner_phone_number, land_type, land_layout_url)
                    VALUES (:user_id, :transaction_hash, :title_deed_number, :title_deed_name, :land_code, :owner_nation_id, :owner_phone_number, :land_type, :land_layout_url)");

                    $stmt->execute([
                        'user_id' => $userId,
                        'transaction_hash' => $transactionHash,
                        'title_deed_number' => $transactionHash,
                        'title_deed_name' => $titleDeedName,
                        'land_code' => $landCode,
                        'owner_nation_id' => $ownerNationId,
                        'owner_phone_number' => $ownerPhoneNumber,
                        'land_type' => $landType,
                        'land_layout_url' => $landLayoutUrl,
                    ]);

                    echo json_encode(['status' => 'success', 'message' => 'Title deed application approved on blockchain.']);
                } else {
                    echo json_encode(['error' => 'Failed to retrieve required details for application ID: ' . $applicationId]);
                }
            } else {
                echo json_encode(['error' => 'No application found with given ID']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to process application: ' . $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?>
