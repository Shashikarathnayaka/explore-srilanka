<?php
session_start();

// 1. Database Connection (Port 3307)
$conn = new mysqli("localhost", "root", "", "explore_srilanka_db");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $conn->real_escape_string($_POST['email']);
    $password = $conn->real_escape_string($_POST['password']);

    $sql = "SELECT * FROM users WHERE email = '$email' AND password = '$password'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        $username = $user['username'];

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $username;

        $update_status = "UPDATE users SET status = 1 WHERE email = '$email'";
        $conn->query($update_status);

        echo "success";
    } else {
        echo "Incorrect email address or password!";
    }
}

$conn->close();
?>