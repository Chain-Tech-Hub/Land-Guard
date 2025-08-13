<?php

header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
header("Access-Control-Allow-Methods: *");
header("Access-Control-Allow-Headers: *");

require_once("../../conn.php");



$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Read operation (fetch lands)
        $stmt = $pdo->query('SELECT * FROM land');
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($result);
        break;

    case 'POST':
        // Create operation (add a new land)
        $data = json_decode(file_get_contents('php://input'), true);

        //initialise variables
        $land_id = $_POST['land_id'];
        $description = $_POST['description'];
        $type = $_POST['type'];
        $size = $_POST['size'];
        $land_loard = $_POST['land_loard'];
        $owner_id = $_POST['owner_id'];
        $price = "9500";
        $duration = "99";
        $land_status = 0;
        $layout =   $_POST['land_layout'];


        $stmt = $pdo->prepare('INSERT INTO land (
            land_id, owner_id, description,
             type, size, land_loard,
              layout, price, duration,
               land_status
           ) VALUES (
           ?, ?, ?, 
           ?, ?, ?,
            ?, ?, ?,

             ?)');

        $stmt->execute([$land_id, $owner_id, $description, $type, $size, $land_loard, $layout, $price, $duration, $land_status]);



        echo json_encode(['message' => 'Land added successfully']);
        break;

   case 'PUT':
    // Create operation (add a new land)
        $data2 = json_decode(file_get_contents('php://input'), true);

    try {
        // Step 1: Get input parameters
        $land_id = (string)$_GET['land_code'] ?? null;
        $price = $_GET['price'] ?? null;
        $land_status = (int)($_GET['land_status'] ?? null);

        

        // Step 2: Prepare the statement
        $stmt = $pdo->prepare('UPDATE land SET price=?, land_status=? WHERE land_id=?');

        // Step 3: Execute the statement
        if ($stmt === false) {
            throw new Exception("Failed to prepare statement");
        }

        $result = $stmt->execute([$price, $land_status, $land_id]);


        if ($result === false) {
            throw new Exception("Failed to execute statement");
        }

        
        echo json_encode(['message' => 'Land updated successfully']);
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
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
