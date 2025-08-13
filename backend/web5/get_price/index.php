<?php

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: *");

require_once("../../conn.php");



$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':

    // Read operation (fetch books)
 $data = json_decode(file_get_contents('php://input'), true);
 // $land_code =(string) $_GET['land_code'];
  $land_code = $data['land_code'];
 
   $stmt = $pdo->prepare('SELECT * FROM land WHERE land_id = :land_code');
            $stmt->bindParam(':land_code', $land_code); 
        
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
        // Update operation (edit a land)
        parse_str(file_get_contents('php://input'), $data);
        $id = $data['id'];
        $land_id = $data['land_id'];
        $owner_id = $data['owner_id'];
        $description = $data['description'];
        $type = $data['type'];
        $size = $data['size'];
        $land_loard = $data['land_loard'];
        $layout = $data['layout'];
        $price = $data['price'];
        $duration = $data['duration'];
        $approved = $data['approved'];

        $stmt = $pdo->prepare('UPDATE land SET land_id=?, owner_id=?, description=?, type=?, size=?, land_loard=?, layout=?, price=?, duration=?, approved=? WHERE id=?');
        $stmt->execute([$land_id, $owner_id, $description, $type, $size, $land_loard, $layout, $price, $duration, $approved, $id]);

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

?>
