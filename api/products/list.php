<?php
require_once __DIR__ . '/../../config/security.php';
require_once __DIR__ . '/../../config/helpers.php';
$pdo = getPdo();

$category = sanitizeText($_GET['category'] ?? '');
$search = sanitizeText($_GET['search'] ?? '');
$limit = isset($_GET['limit']) ? max(0, (int) $_GET['limit']) : 100;
$isFeatured = isset($_GET['featured']) ? parseBool($_GET['featured']) : null;
$isNew = isset($_GET['new']) ? parseBool($_GET['new']) : null;
$isAdmin = isset($_GET['admin']) && $_GET['admin'] === '1';
if ($isAdmin) {
    requireAuth();
}

$sql = 'SELECT p.*, c.slug AS category_slug, c.name AS category_name FROM products p JOIN categories c ON p.category_id = c.id';
$params = [];
$sql .= ' WHERE 1=1';
if (!$isAdmin) {
    $sql .= ' AND p.is_active = 1';
}
if ($category !== '') {
    $sql .= ' AND c.slug = ?';
    $params[] = $category;
}
if ($search !== '') {
    $sql .= ' AND LOWER(p.name) LIKE ?';
    $params[] = '%' . mb_strtolower($search, 'UTF-8') . '%';
}
if ($isFeatured !== null) {
    $sql .= ' AND p.is_featured = ?';
    $params[] = $isFeatured ? 1 : 0;
}
if ($isNew !== null) {
    $sql .= ' AND p.created_at >= ?';
    $params[] = date('Y-m-d H:i:s', strtotime('-30 days'));
}
$sql .= ' ORDER BY p.is_featured DESC, p.created_at DESC, p.updated_at DESC LIMIT ?';
$params[] = $limit;
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$products = [];
while ($row = $stmt->fetch()) {
    $row['id'] = (int) $row['id'];
    $row['price'] = (float) $row['price'];
    $row['originalPrice'] = $row['discount_price'] !== null ? (float) $row['discount_price'] : null;
    $row['discountPercent'] = $row['discount_percent'] !== null ? (int) $row['discount_percent'] : null;
    $row['isFeatured'] = (bool) $row['is_featured'];
    $row['isNew'] = (strtotime($row['created_at']) >= strtotime('-30 days'));
    $row['category'] = $row['category_slug'];
    $row['category_name'] = $row['category_name'];
    $products[] = $row;
}

$mapped = fetchProductDetails($products, $pdo);
jsonResponse(['success' => true, 'data' => $mapped]);
