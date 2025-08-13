<?php
require("vendor/autoload.php");

use Web3\Web3;
use Web3\Providers\HttpProvider;
use Web3\Eth;



header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Origin: *");
header('Content-Type: *');
header("Access-Control-Allow-Methods: *");
header("Access-Control-Allow-Headers: *");



// $servername = "localhost";
// $username = "root";
// $password = "";
// $dbname = "";

// $servername = "localhost";
// $username = "u897516670_chaintechhub";
// $password = "P@55w0rD!G8&Zx7YtLq3#";
// $dbname = "u897516670_chaintechhub";

$newAccount = '';

try {
    $pdo = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
   

$web3 = new Web3('http://localhost:8545');


  $eth = $web3->eth;

// $eth->accounts(function ($err, $accounts) use ($eth) {
//     if ($err !== null) {
//         echo 'Error: ' . $err->getMessage();
//         return;
//     }
//     foreach ($accounts as $account) {
//         echo 'Account: ' . $account . PHP_EOL;

//         $eth->getBalance($account, function ($err, $balance) {
//             if ($err !== null) {
//                 echo 'Error: ' . $err->getMessage();
//                 return;
//             }
//             echo 'Balance: ' . $balance . PHP_EOL;
//         });
//     }
// });


//     echo json_encode($eth);

} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}
