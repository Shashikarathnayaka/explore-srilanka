<!-- <?php
session_start();

$env = parse_ini_file('../.env');
$client_id = $env['GOOGLE_CLIENT_ID'];
$client_secret = $env['GOOGLE_CLIENT_SECRET'];

$redirect_uri = 'http://localhost/srilanka/project/php/google_login.php';


if (isset($_GET['code'])) {

    $params = [
        'client_id' => $client_id,
        'client_secret' => $client_secret,
        'redirect_uri' => $redirect_uri,
        'code' => $_GET['code'],
        'grant_type' => 'authorization_code',
    ];

    $ch = curl_init('https://oauth2.googleapis.com/token');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
    $response = curl_exec($ch);

    if (curl_error($ch)) {
        die('cURL Error: ' . curl_error($ch));
    }
    curl_close($ch);

    $data = json_decode($response, true);

    if (isset($data['access_token'])) {

        $user_info = file_get_contents(
            'https://www.googleapis.com/oauth2/v1/userinfo?access_token=' . $data['access_token']
        );
        $user = json_decode($user_info, true);

        $email = $user['email'];
        $name = $user['name'];

        $conn = new mysqli("localhost", "root", "", "explore_srilanka_db", 3307);

        if ($conn->connect_error) {
            die("Database connection failed.: " . $conn->connect_error);
        }

        $check = $conn->prepare("SELECT * FROM users WHERE email = ?");
        $check->bind_param("s", $email);
        $check->execute();
        $result = $check->get_result();

        if ($result->num_rows > 0) {
            // If the user is present, set the status to 1 (Online).

            $update = $conn->prepare("UPDATE users SET status = 1 WHERE email = ?");
            $update->bind_param("s", $email);
            $update->execute();
            $update->close();
        } else {

            $insert = $conn->prepare("INSERT INTO users (username, email, status) VALUES (?, ?, 1)");
            $insert->bind_param("ss", $name, $email);
            $insert->execute();
            $insert->close();
        }

        $check->close();
        $conn->close();

        $_SESSION['username'] = $name;
        header("Location: ../index.html");
        exit();

    } else {
        echo "Google Login Failed! Try again.";
    }

} else {
    $login_url = "https://accounts.google.com/o/oauth2/v2/auth?"
        . "scope=email%20profile"
        . "&redirect_uri=" . urlencode($redirect_uri)
        . "&response_type=code"
        . "&client_id=" . $client_id
        . "&prompt=select_account";

    header("Location: " . $login_url);
    exit();
}
?>