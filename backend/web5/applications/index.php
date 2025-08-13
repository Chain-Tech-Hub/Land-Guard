<?php

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: *");

require_once("../../conn.php");

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $stmt = $pdo->prepare("
                SELECT 
                    applications.id AS application_id, 
                    applications.user_id AS application_user_id, 
                    applications.land_id AS application_land_id, 
                    applications.application_date, 
                    applications.accepted,
                    users.id AS user_id, 
                    users.full_name, 
                    users.phone_number, 
                    users.email, 
                    users.address, 
                    users.date_of_birth, 
                    users.nation_id, 
                    users.gender, 
                    users.role,
                    land.id AS land_id, 
                    land.description, 
                    land.type, 
                    land.size, 
                    land.land_loard, 
                    land.layout, 
                    land.price, 
                    land.duration, 
                    land.land_status
                FROM applications
                LEFT JOIN users ON applications.user_id = users.id
                LEFT JOIN land ON applications.land_id = land.land_id
            ");
            $stmt->execute();

            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if ($results) {
                // Modify output to structure it for React DataTable component
                $formattedResults = array_map(function ($row) {
                    return [
                        "application_id" => $row['application_id'],
                        "application_user_id" => $row['application_user_id'],
                        "application_land_id" => $row['application_land_id'],
                        "application_date" => $row['application_date'],
                        "accepted" => $row['accepted'],
                        "user_id" => $row['user_id'],
                        "full_name" => $row['full_name'],
                        "phone_number" => $row['phone_number'],
                        "email" => $row['email'],
                        "address" => $row['address'],
                        "date_of_birth" => $row['date_of_birth'],
                        "nation_id" => $row['nation_id'],
                        "gender" => $row['gender'],
                        "role" => $row['role'],
                        "land_id" => $row['land_id'],
                        "description" => $row['description'],
                        "type" => $row['type'],
                        "size" => $row['size'],
                        "land_loard" => $row['land_loard'],
                        "layout" => $row['layout'],
                        "price" => $row['price'],
                        "duration" => $row['duration'],
                        "land_status" => $row['land_status']
                    ];
                }, $results);

                echo json_encode($formattedResults);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'No data found']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to retrieve data: ' . $e->getMessage()]);
        }
        break;

    case 'POST':
        // Create operation: add a new application
        $data = json_decode(file_get_contents('php://input'), true);

        // Extract data from request
        $user_id = $data['user_id'];
        $land_id = $data['land_code']; // Assuming 'land_code' in the request maps to 'land_id' in the DB

        // Generate other fields
        $application_date = date("Y-m-d H:i:s");
        $accepted = 0;

        try {
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
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'];
    $accepted = $data['accepted'];

    try {
        $stmt = $pdo->prepare("UPDATE applications SET accepted = ? WHERE id = ?");
        $stmt->execute([$accepted, $id]);

        echo json_encode(['status' => 'success', 'message' => 'Application updated successfully']);
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
?>
