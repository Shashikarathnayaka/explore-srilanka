<!-- <?php
$conn = new mysqli("localhost", "root", "", "explore_srilanka_db");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$user = $_POST['user'];
$mail = $_POST['mail'];
$pass = $_POST['pass'];


$sql = "INSERT INTO users (username, email, password) VALUES ('$user', '$mail', '$pass')";

if ($conn->query($sql) === TRUE) {
    echo "Registered successfully.";
} else {
    echo "Error: " . $conn->error;
}

$conn->close();
?> -->


///////////////////// new version with security improvements/////////////////////

<?php
$conn = new mysqli("localhost", "root", "", "explore_srilanka_db");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$user = trim($_POST['user'] ?? '');
$mail = trim($_POST['mail'] ?? '');
$pass = trim($_POST['pass'] ?? '');

// Empty check
if (empty($user) || empty($mail) || empty($pass)) {
    echo "error: Fill in all fields.";
    exit;
}

if (!filter_var($mail, FILTER_VALIDATE_EMAIL)) {
    echo "error: The email is not valid.";
    exit;
}

$hashed_pass = password_hash($pass, PASSWORD_DEFAULT);

$stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $user, $mail, $hashed_pass);

if ($stmt->execute()) {
    echo "Registered successfully.";
} else {
    echo "error: " . $conn->error;
}

$stmt->close();
$conn->close();
?>