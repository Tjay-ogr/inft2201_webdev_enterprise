<?php
require  __DIR__ . '/../../../autoload.php';

use Application\Mail;
use Application\Database;
use Application\Page;
use Application\Verifier;

$database = new Database('prod');
$page = new Page();
$mail = new Mail($database->getDb());

// verify JWT and get user info
$verifier = new Verifier();
$user = $verifier->verifyToken();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // only allow valid roles
    if ($user->role !== 'user' && $user->role !== 'admin') {
        http_response_code(403);
        echo json_encode(["error" => "Forbidden"]);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);

    if (array_key_exists('name', $data) && array_key_exists('message', $data)) {
        $id = $mail->createMail($data['name'], $data['message']);
        $page->item(array("id" => $id));
    } else {
        $page->badRequest();
    }

} else if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    // require valid token
    if (!$user) {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized"]);
        exit;
    }

    $page->item($mail->listMail());

} else {
    $page->badRequest();
}