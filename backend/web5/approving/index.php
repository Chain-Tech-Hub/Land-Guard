<?php

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: *");

require_once("../../conn.php");



$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':

        $approved = "3";
        $stmt = $pdo->prepare('SELECT land.*,users.full_name, users.phone_number
        FROM land
        INNER JOIN users ON land.owner_id = users.id
        WHERE approved=:approved');
        $stmt->execute([':approved' => $approved]);

        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($result);
        break;

    case 'POST':
        // Create operation (add a new land)
        $data = json_decode(file_get_contents('php://input'), true);


        $land_id = $_POST['land_id'];
        $description = $_POST['description'];
        $type = $_POST['type'];
        $size = $_POST['size'];
        $land_loard =   isset($_POST['land_loard']) ? $_POST['land_loard'] : 'lands';


        $owner_id = isset($_POST['owner_id']) ? $_POST['owner_id'] : '';
        $price = isset($_POST['land_loard']) ? "60000" : "0";
        $duration = "Not Registered";
        $approved = "0";


        $layout =   $_POST['selectedFile'];




        $stmt = $pdo->prepare('INSERT INTO land (
            land_id, owner_id, description,
             type, size, land_loard,
              layout, price, duration,
               approved
           ) VALUES (
           ?, ?, ?, 
           ?, ?, ?,
            ?, ?, ?,

             ?)');

        $stmt->execute([$land_id, $owner_id, $description, $type, $size, $land_loard, $layout, $price, $duration, $approved]);



        echo json_encode(['message' => 'Land added successfully']);
        break;
    case 'PUT':
        $land_id = $_GET['land_code'];
        $price = $_GET['price'];
        $phone_number = $_GET['owner'];

        $approved = "3";

        // First, fetch the user_id based on the phone_number
        $stmt = $pdo->prepare('SELECT id FROM users WHERE phone_number = ?');
        $stmt->execute([$phone_number]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            $user_id = $user['id'];

            // Now, update the land table with the new user_id
            $stmt = $pdo->prepare('UPDATE land SET approved=?, price=?, owner_id=? WHERE id=?');
            $stmt->execute([$approved, $price, $user_id, $land_id]);

            echo json_encode(['message' => 'Land updated successfully']);
        } else {
            echo json_encode(['message' => 'User not found']);
        }
        break;


    case 'DELETE':
        // Delete operation (remove a land)
        $id = $_GET['id'];

        $stmt = $pdo->prepare('DELETE FROM land WHERE id=?');
        $stmt->execute([$id]);

        echo json_encode(['message' => 'Land deleted successfully']);
        break;

    default:
        // Invalid method
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
