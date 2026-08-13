<?php
require_once __DIR__ . '/../../config/security.php';
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}
if (empty($_SESSION['admin_id'])) {
    jsonResponse(['success' => false, 'error' => 'Unauthorized'], 401);
}
jsonResponse(['success' => true, 'data' => ['admin_id' => $_SESSION['admin_id'], 'username' => $_SESSION['admin_username'], 'role' => $_SESSION['admin_role']]]);
