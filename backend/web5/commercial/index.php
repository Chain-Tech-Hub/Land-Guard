
<?php

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: *");

require_once("../../conn.php");



$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':

        $land_status = 2;
        $land_type = "Commercial";
        $stmt = $pdo->prepare('SELECT land.*,users.*
        FROM land
        INNER JOIN users ON land.owner_id = users.id
        WHERE land_status =:land_status and land.type =:land_type');
        $stmt->execute([':land_status' => $land_status, 'land_type'=>$land_type]);

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


// Assuming this is part of a larger switch-case block


     case 'PUT':
     $data = json_decode(file_get_contents('php://input'), true);


    try {
        // Step 1: Get input parameters
        $land_id = $data['land_code'];
        $price = $data['price'];
        $land_status = $data['land_status'];
        $owner_id = $data['owner_id'];



        // Step 2: Prepare the statement
        $stmt = $pdo->prepare('UPDATE land SET price=?,owner_id=?, land_status=? WHERE land_id=?');

        // Step 3: Execute the statement
        if ($stmt === false) {
            throw new Exception("Failed to prepare statement");
        }

        $result = $stmt->execute([$price,$owner_id, $land_status, $land_id]);


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
