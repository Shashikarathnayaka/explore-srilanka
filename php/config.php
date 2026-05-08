<?php
$host = "127.0.0.1";
$user = "root";
$pass = "";
$dbname = "explore_srilanka_db";
$port = 3307; // sql port

 $conn = new mysqli($host, $user, $pass, $dbname, $port);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>