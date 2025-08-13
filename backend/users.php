<?php



header('Access-Control-Allow-Origin:*');
header('Content-Type: application/json');
header('Access-Control-Allow-Method: GET');
header('Access-Control-Allow-Heagers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Request-with');

header('Access-Control-Allow-Origin: *');


require_once 'conn.php';
// // Set the content type to JSON
// header('Content-Type: application/json', '{ mode: 'no-cors'}');

$method = $_SERVER['REQUEST_METHOD'];
switch ($method) {
 case 'GET':
 // Read operation (fetch books)
 $stmt = $pdo->query('SELECT * FROM users');
 $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
 echo json_encode($result);
 break;
 case 'POST':
 // Create operation (add a new book)
 $data = json_decode(file_get_contents('php://input'), true);
 $full_name = $data['full_name'];
 $password = $data['password'];
 $email = $data['email'];
 
 $stmt = $pdo->prepare('INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)');
 $stmt->execute([$full_name, $email, $password]);
 
 echo json_encode(['message' => 'User added successfully']);
 break;
 case 'PUT':
 // Update operation (edit a book)
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

?>