<?php
$host = "localhost";
$dbname = "explore_srilanka_db";
$username = "root";
$password = "";  // XAMPP no password by default

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8",
        $username,
        $password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "DB connection failed."]);
    exit;
}
?>