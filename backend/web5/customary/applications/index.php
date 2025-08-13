
<?php

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: *");

require_once("../../../conn.php");

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Retrieve all applications or a specific application by ID
        $id = isset($_GET['id']) ? $_GET['id'] : null;

        if ($id) {
            $stmt = $pdo->prepare('SELECT * FROM applications WHERE id=:id');
            $stmt->execute([':id' => $id]);
        } else {
            $stmt = $pdo->prepare('SELECT * FROM applications');
            $stmt->execute();
        }

        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($result);
        break;

    case 'POST':
        // Create a new application
        $data = json_decode(file_get_contents('php://input'), true);

        $user_id = $data['user_id'];
        $land_id = $data['land_id'];
        $application_date = $data['application_date'];
        $accepted = $data['accepted'];
        $to_id = $data['to_id'];
        $nature = $data['nature'];
        $description = $data['description'];
        $national_id = $data['national_id'];

        $stmt = $pdo->prepare("INSERT INTO `applications`(
            `user_id`, `land_id`, `application_date`, `accepted`, `to_id`, `nature`, `description`, `national_id`) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $user_id, $land_id, $application_date, $accepted, $to_id, $nature, $description, $national_id
        ]);

        echo json_encode(['message' => 'Application added successfully']);
        break;

    case 'PUT':
        // Update an existing application
        $id = $_GET['id'];
        $data = json_decode(file_get_contents('php://input'), true);

        $stmt = $pdo->prepare('UPDATE applications SET 
            user_id=?, land_id=?, application_date=?, accepted=?, to_id=?, nature=?, description=?, national_id=? 
            WHERE id=?');
        $stmt->execute([
            $data['user_id'], $data['land_id'], $data['application_date'], $data['accepted'], $data['to_id'], $data['nature'], $data['description'], $data['national_id'], $id
        ]);

        echo json_encode(['message' => 'Application updated successfully']);
        break;

    case 'DELETE':
        // Delete an application
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
