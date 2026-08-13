<?php
require_once __DIR__ . '/../../config/security.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}
requireCsrfToken();
$pdo = getPdo();
$adminId = $_SESSION['admin_id'] ?? null;
logoutSession();
if ($adminId) {
    logSecurityEvent($pdo, $adminId, 'logout', 'Admin logged out');
}
jsonResponse(['success' => true]);
