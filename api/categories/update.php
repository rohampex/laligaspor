<?php
require_once __DIR__ . '/../../config/security.php';
require_once __DIR__ . '/../../config/helpers.php';
requireAuth();
requireCsrfToken();
$pdo = getPdo();
$data = getJsonInput();
$id = isset($data['id']) ? (int) $data['id'] : 0;
if ($id <= 0) {
    jsonResponse(['success' => false, 'error' => 'Invalid category id'], 400);
}
$name = sanitizeText($data['name'] ?? '');
$slug = sanitizeSlug($data['slug'] ?? $name);
if (!$name) {
    jsonResponse(['success' => false, 'error' => 'Name is required'], 400);
}
$description = sanitizeText($data['description'] ?? '');
$image = sanitizeText($data['image'] ?? '');
$sortOrder = max(0, (int) ($data['sort_order'] ?? 0));
$isActive = parseBool($data['is_active'] ?? true);
$stmt = $pdo->prepare('UPDATE categories SET name = ?, slug = ?, description = ?, image = ?, sort_order = ?, is_active = ?, updated_at = NOW() WHERE id = ?');
$stmt->execute([$name, $slug, $description, $image, $sortOrder, $isActive, $id]);
logSecurityEvent($pdo, $_SESSION['admin_id'], 'category_update', "Category {$id} updated");
jsonResponse(['success' => true]);
