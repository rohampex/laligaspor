<?php
require_once __DIR__ . '/../../config/security.php';
require_once __DIR__ . '/../../config/helpers.php';
requireAuth();
requireCsrfToken();
$pdo = getPdo();
$id = isset($_POST['id']) ? (int) $_POST['id'] : 0;
if ($id <= 0) {
    jsonResponse(['success' => false, 'error' => 'Invalid product id'], 400);
}
$stmt = $pdo->prepare('DELETE FROM products WHERE id = ?');
$stmt->execute([$id]);
logSecurityEvent($pdo, $_SESSION['admin_id'], 'product_delete', "Product {$id} deleted");
jsonResponse(['success' => true]);
