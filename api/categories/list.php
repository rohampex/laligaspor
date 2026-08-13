<?php
require_once __DIR__ . '/../../config/security.php';
$pdo = getPdo();
$isAdmin = isset($_GET['admin']) && $_GET['admin'] === '1';
if ($isAdmin) {
    requireAuth();
}
$where = $isAdmin ? '' : 'WHERE c.is_active = 1';
$stmt = $pdo->query('SELECT c.id, c.name, c.slug, c.description, c.image, c.sort_order, c.is_active, COUNT(p.id) AS product_count FROM categories c LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1 ' . $where . ' GROUP BY c.id ORDER BY c.sort_order ASC, c.name ASC');
$categories = [];
while ($row = $stmt->fetch()) {
    $categories[] = [
        'id' => (int) $row['id'],
        'name' => $row['name'],
        'slug' => $row['slug'],
        'description' => $row['description'],
        'image' => $row['image'],
        'sortOrder' => (int) $row['sort_order'],
        'isActive' => (bool) $row['is_active'],
        'productCount' => (int) $row['product_count']
    ];
}
jsonResponse(['success' => true, 'data' => $categories]);
