<?php

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: *");

require_once("../../conn.php");

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Read operation: fetch applications for a specific user where accepted = 1
        $user_id = (int) $_GET['user_id']; // Get user_id from request parameters

            $accepted = 0;
            
            try {
                $stmt = $pdo->prepare("
                    SELECT applications.id AS appliction_number, applications.*, land.*
                    FROM applications
                    
                    INNER JOIN land ON applications.land_id = land.land_id
                    WHERE applications.user_id = :user_id and land_status = 5
                    
                ");
                $stmt->execute(['user_id'=>$user_id]);

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
