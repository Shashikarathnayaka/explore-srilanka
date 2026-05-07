<?php
session_start();
$conn = new mysqli("localhost", "root", "", "explore_srilanka_db");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if (isset($_SESSION['username'])) {
    $username = $_SESSION['username'];

    $update_status = "UPDATE users SET status = 0 WHERE username = '$username'";
    $conn->query($update_status);
}

session_unset();
session_destroy();

header("Location: ../index.html");
exit();
?>