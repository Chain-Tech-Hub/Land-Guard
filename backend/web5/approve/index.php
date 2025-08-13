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


        $land_id = $_POST['land_id'];
        $description = $_POST['description'];
        $type = $_POST['type'];
        $size = $_POST['size'];
        $land_loard = $_POST['land_loard'];


        $owner_id = "3";
        $price = "9500";
        $duration = "90";
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
        $approved = "1";

        $stmt = $pdo->prepare('UPDATE land SET approved=?, price=? WHERE land_id=?');
        $stmt->execute([$approved, $price, $land_id]);

        echo json_encode(['message' => 'Land updated successfully']);
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
