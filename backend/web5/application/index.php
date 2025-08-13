<?php

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: *");

require_once("../../conn.php");

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
   case 'GET':
        // Read operation: fetch applications for a specific user
        $user_id = $_GET['user_id'] ?? 1; // Get user_id from request parameters
        
        if ($user_id) {
            $stmt = $pdo->prepare("
                SELECT land.*, users.*
                FROM land
                INNER JOIN users ON land.owner_id = users.id
                WHERE land.owner_id = :user_id
            ");
            $stmt->execute(['user_id' => $user_id]);
        } else {
            // If user_id is not provided, return an error
            http_response_code(400);
            echo json_encode(['error' => 'User ID is required']);
            exit;
        }

        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($result);
        break;

case 'POST':
        // Create operation: add a new application
        $data = json_decode(file_get_contents('php://input'), true);

        // Extract data from request
        $user_id = $data['user_id'];
        $land_id = $data['land_code']; // Assuming 'land_code' in the request maps to 'land_id' in the 

        // Generate other fields
        $application_date = date("Y-m-d H:i:s");
        $land_status = 5; //new application
        $accepted =0;

        try {
            $stmt1 = $pdo->prepare("UPDATE land SET land_status = :land_status WHERE land_id = :land_id");
            $stmt1->execute(['land_status'=> $land_status, 'land_id'=>$land_id]);
            
            $stmt = $pdo->prepare("INSERT INTO applications (user_id, land_id, application_date, accepted) VALUES (?, ?, ?, ?)");
            $stmt->execute([$user_id, $land_id, $application_date, $accepted]);

            echo json_encode(['message' => 'Application added successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to add application: ' . $e->getMessage()]);
        }
        break;

case 'PUT':
        // Update operation: edit an application
        parse_str(file_get_contents('php://input'), $data);
        $id = $data['id'];
       
       
        $accepted = $data['accepted'];

        try {
            $stmt = $pdo->prepare("UPDATE applications SET  accepted = ? WHERE id = ?");
            $stmt->execute([ $accepted, $id]);

            echo json_encode(['message' => 'Application updated successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update application: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        // Delete operation: remove an application
        $id = $_GET['id'];

        try {
            $stmt = $pdo->prepare("DELETE FROM applications WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode(['message' => 'Application deleted successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete application: ' . $e->getMessage()]);
        }
        break;

    default:
        // Invalid method
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
