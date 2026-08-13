<?php
require_once __DIR__ . '/../../config/security.php';
require_once __DIR__ . '/../../config/helpers.php';
requireAuth();
requireCsrfToken();
$pdo = getPdo();
$data = getJsonInput();
$name = sanitizeText($data['name'] ?? '');
$slug = sanitizeSlug($data['slug'] ?? $name);
if (!$name) {
    jsonResponse(['success' => false, 'error' => 'Name is required'], 400);
}
$description = sanitizeText($data['description'] ?? '');
$image = sanitizeText($data['image'] ?? '');
$sortOrder = max(0, (int) ($data['sort_order'] ?? 0));
$isActive = parseBool($data['is_active'] ?? true);
$stmt = $pdo->prepare('INSERT INTO categories (name, slug, description, image, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)');
$stmt->execute([$name, $slug, $description, $image, $sortOrder, $isActive]);
$categoryId = (int) $pdo->lastInsertId();
logSecurityEvent($pdo, $_SESSION['admin_id'], 'category_create', "Category {$name} created");
jsonResponse(['success' => true, 'data' => ['id' => $categoryId]]);
