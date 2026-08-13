<?php
require_once __DIR__ . '/../../config/security.php';
require_once __DIR__ . '/../../config/helpers.php';
requireAuth();
requireCsrfToken();
$pdo = getPdo();
$data = getJsonInput();
$id = isset($data['id']) ? (int) $data['id'] : 0;
if ($id <= 0) {
    jsonResponse(['success' => false, 'error' => 'Invalid offer id'], 400);
}
$stmt = $pdo->prepare('DELETE FROM offers WHERE id = ?');
$stmt->execute([$id]);
logSecurityEvent($pdo, $_SESSION['admin_id'], 'offer_delete', "Offer {$id} deleted");
jsonResponse(['success' => true]);
