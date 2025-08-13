<?php

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: *");

require '../../conn.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query('SELECT * FROM users');
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($result);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $full_name = $data['full_name'];
        $password = $data['password'];
        $phone_number = $data['phone_number'];
        $address = $data['address'];
        $private_key = $data['private_key'];
        $public_key = $data['public_key'];
        $wallet_address = $data['wallet'];
        $land = $data['land'];
        $land_process = $data['land_process'];

        $stmt = $pdo->prepare('INSERT INTO users (full_name, phone_number, password, address, private_key, date_of_birth, email, nation_id, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([$full_name, $phone_number, $password, $address, $private_key, $public_key, $wallet_address, $land, $land_process]);

        echo json_encode(['message' => 'User added successfully']);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'];
        $land = $data['land'];
        $land_process = $data['land_process'];
        $private_key = $data['private_key'];
        $public_key = $data['public_key'];
        $wallet_address = $data['wallet_address'];

        $stmt = $pdo->prepare('UPDATE users SET land=?, land_process=?, private_key=?, public_key=?, wallet_address=? WHERE id=?');
        $stmt->execute([$land, $land_process, $private_key, $public_key, $wallet_address, $id]);

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
