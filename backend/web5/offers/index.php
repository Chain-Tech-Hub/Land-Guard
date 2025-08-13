<?php

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: *");

require '../../conn.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query('SELECT * FROM offers');
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($result);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);

        $application_id = $data['application_id'];
        $applicant_id = $data['applicant_id'];
        $gr_number = $data['gr_no'];
        $endorsed = " ";
        $offer_accepted = " ";
        $developmental_charge = $data['developmental_charge'];
        $city_layout = " ";

        $stmt = $pdo->prepare('INSERT INTO offers (application_id, applicant_id, gr_number, endorsed, offer_accepted, developmental_charge, city_layout) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([$application_id, $applicant_id, $gr_number, $endorsed, $offer_accepted, $developmental_charge, $city_layout]);

        echo json_encode(['message' => 'Offer added successfully']);
        break;

    case 'PUT':
        parse_str(file_get_contents('php://input'), $data);
        $id = $data['id'];
        $full_name = $data['full_name'];
        $email = $data['email'];
        $password = $data['password'];

        $stmt = $pdo->prepare('UPDATE users SET full_name=?, email=?, password=? WHERE id=?');
        $stmt->execute([$full_name, $email, $password, $id]);

        echo json_encode(['message' => 'User updated successfully']);
        break;

    case 'DELETE':
        $id = $_GET['id'];

        $stmt = $pdo->prepare('DELETE FROM users WHERE id=?');
        $stmt->execute([$id]);

        echo json_encode(['message' => 'User deleted successfully']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

?>
