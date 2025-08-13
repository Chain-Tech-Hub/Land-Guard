<?php

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: *");

require_once("../../../conn.php");

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $land_id = $_GET['listed_land_id'];

        $stmt = $pdo->prepare('SELECT land.*,users.*
        FROM land
        INNER JOIN users ON land.owner_id = users.id
        WHERE land_id=:land_id');
        $stmt->execute([':land_id' => $land_id]);

        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($result);
        break;


    case 'POST':
        // Create operation (add a new application)
        $data = json_decode(file_get_contents('php://input'), true);

        $user_id = '1';
        $transaction_hash = $data['tx_hash'];
        $title_deed_number = $data['title_deed_number'];
        $title_deed_name = $data['title_deed_name'];
        $land_code = $data['land_code'];
        $owner_nation_id = $data['owner_nation_id'];

        $owner_phone_number = $data['owner_phone_number'];
        $land_type = $data['land_type'];
        $land_layout_url = $data['land_layout_url'];

        $stmt = $pdo->prepare("INSERT INTO `blockchain_transactions`(
            `user_id`, `transaction_hash`, 
            `title_deed_number`, `title_deed_name`, 
            `land_code`, `owner_nation_id`,
         `owner_phone_number`, `land_type`,
          `land_layout_url`) 
         VALUES (?, ?, ?,
          ?, ?, ?, 
          ?, ?,?)");
        $stmt->execute([
            $user_id, $transaction_hash, $title_deed_number,
            $title_deed_name,  $land_code,  $owner_nation_id,
            $owner_phone_number, $land_type,

            $land_layout_url
        ]);




        echo json_encode(['message' => 'Application added successfully']);
        break;



    case 'PUT':
        $land_id = $_GET['land_code'];
        $price = "9500";
        $approved = "1";

        $stmt = $pdo->prepare('UPDATE land SET approved=?, price=? WHERE land_id=?');
        $stmt->execute([$approved, $price, $land_id]);

        echo json_encode(['message' => 'Land updated successfully']);
        break;

    case 'DELETE':
        // Delete operation (remove an application)
        $id = $_GET['id'];

        $stmt = $pdo->prepare('DELETE FROM applications WHERE id=?');
        $stmt->execute([$id]);

        echo json_encode(['message' => 'Application deleted successfully']);
        break;

    default:
        // Invalid method
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
