<?php
require_once __DIR__ . '/../../config/security.php';
require_once __DIR__ . '/../../config/helpers.php';
requireAuth();
requireCsrfToken();
$pdo = getPdo();
id = isset($_POST['id']) ? (int) $_POST['id'] : 0;
if ($id <= 0) {
    jsonResponse(['success' => false, 'error' => 'Invalid blog id'], 400);
}
$stmt = $pdo->prepare('DELETE FROM blog_posts WHERE id = ?');
$stmt->execute([$id]);
logSecurityEvent($pdo, $_SESSION['admin_id'], 'blog_delete', "Blog {$id} deleted");
jsonResponse(['success' => true]);
