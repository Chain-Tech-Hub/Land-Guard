<?php


header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Origin: *");
header('Content-Type: *');
header("Access-Control-Allow-Methods: *");
header("Access-Control-Allow-Headers: *");



// $servername = "localhost";
// $username = "root";
// $password = "";
// $dbname = "mzuniadmin";

$servername = "localhost";
$username = "u897516670_chaintechhub";
$password = "P@55w0rD!G8&Zx7YtLq3#";
$dbname = "u897516670_chaintechhub";



try {
    $pdo = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}
