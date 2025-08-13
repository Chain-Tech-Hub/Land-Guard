<?php

header("Access-Control-Allow-Origin: *");
header('Content-Type: *');
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: *");

require_once("../../conn.php");

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Read operation: fetch applications for a specific user where accepted = 1
         // Get user_id from request parameters

            $accepted = 6;
            
            try {
                $stmt = $pdo->prepare("
                    SELECT applications.id as applications_id, applications.*, users.*, land.*
                    FROM applications
                    INNER JOIN users ON applications.user_id = users.id
                    INNER Join land On applications.land_id= land.land_id
                    WHERE applications.accepted = 6
                ");
                $stmt->execute();

                $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode($result);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to fetch applications: ' . $e->getMessage()]);
            }
       
        break;

    // Other cases (POST, PUT, DELETE) remain the same
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?>
