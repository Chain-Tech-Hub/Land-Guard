<?php


header("Access-Control-Allow-Origin: *");

header('Content-Type: *');

header('Access-Control-Allow-Heagers: *');

header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: * ");



require_once("../../conn.php");

$method = $_SERVER['REQUEST_METHOD'];



switch ($method) {
  case 'GET':


    // Read operation (fetch books)
    $data = json_decode(file_get_contents('php://input'), true);
    $full_name = (string) $_GET['email'];

    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = :full_name');
    $stmt->bindParam(':full_name', $full_name);

    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);


    echo json_encode($result);

    break;
  case 'POST':
    // Create operation (add a new book)
    $data = json_decode(file_get_contents('php://input'), true);
    $full_name = $data['name'];
    $password = $data['password'];
    $phone_number = $data['phone_number'];
    $address = $data['address'];




    $stmt = $pdo->prepare('INSERT INTO users (full_name, phone_number, password, address) VALUES (?, ?, ?, ?)');
    $stmt->execute([$full_name, $phone_number, $password, $address]);

    echo json_encode(['message' => 'User added successfully']);
    break;

  case 'PUT':
    // Update operation (edit a book)
    parse_str(file_get_contents('php://input'), $data);
    $id = $data['id'];
    $full_name = $data['full_name'];
    $phone_number = $data['phone_number'];
    $password = $data['password'];

    $stmt = $pdo->prepare('UPDATE users SET full_name=?, phone_number=?, password=? WHERE id=?');
    $stmt->execute([$full_name, $phone_number, $password, $id]);

    echo json_encode(['message' => 'User updated successfully']);
    break;
  case 'DELETE':
    // Delete operation (remove a book)
    $id = $_GET['id'];

    $stmt = $pdo->prepare('DELETE FROM users WHERE id=?');
    $stmt->execute([$id]);

    echo json_encode(['message' => 'User deleted successfully']);
    break;
  default:
    // Invalid method
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    break;
}
