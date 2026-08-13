<?php
require_once __DIR__ . '/../../config/security.php';
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}
$token = generateCsrfToken();
jsonResponse(['success' => true, 'data' => ['csrfToken' => $token]]);
