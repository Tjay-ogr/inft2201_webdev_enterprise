<?php
require '../../../vendor/autoload.php';

use Application\Mail;
use Application\Page;

$dsn = "pgsql:host=" . getenv('DB_PROD_HOST') . ";dbname=" . getenv('DB_PROD_NAME');

try {
    $pdo = new PDO($dsn, getenv('DB_USER'), getenv('DB_PASS'), [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

$mail = new Mail($pdo);
$page = new Page();


# Extract ID from URI

$uri = $_SERVER['REQUEST_URI'];
$parts = explode('/', trim($uri, '/'));
$id = end($parts);

if (!is_numeric($id)) {
    $page->badRequest();
    exit;
}

$id = (int) $id;


# List single mail entry

if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    $result = $mail->getMail($id);

    if (!$result) {
        $page->notFound();
        exit;
    }

    $page->item($result);
    exit;
}

#put update mail

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {

    $json = file_get_contents("php://input");
    $data = json_decode($json, true);

    if (!isset($data['subject'], $data['body'])) {
        $page->badRequest();
        exit;
    }

    $updated = $mail->updateMail($id, $data['subject'], $data['body']);

    if (!$updated) {
        $page->notFound();
        exit;
    }

    echo json_encode(["updated" => true]);
    exit;
}

#delete mail

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {

    $deleted = $mail->deleteMail($id);

    if (!$deleted) {
        $page->notFound();
        exit;
    }

    echo json_encode(["deleted" => true]);
    exit;
}

$page->badRequest();

