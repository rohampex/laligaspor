<?php
require_once __DIR__ . '/../../config/security.php';
require_once __DIR__ . '/../../config/helpers.php';
$pdo = getPdo();

$slug = sanitizeText($_GET['slug'] ?? '');
if (!$slug) {
    jsonResponse(['success' => false, 'error' => 'Missing product slug'}, 400);
}

$stmt = $pdo->prepare('SELECT p.*, c.slug AS category_slug, c.name AS category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.slug = ? AND p.is_active = 1 LIMIT 1');
$stmt->execute([$slug]);
$product = $stmt->fetch();
if (!$product) {
    jsonResponse(['success' => false, 'error' => 'Product not found'}, 404);
}
$product['id'] = (int) $product['id'];
$product['price'] = (float) $product['price'];
$product['originalPrice'] = $product['discount_price'] !== null ? (float) $product['discount_price'] : null;
$product['discountPercent'] = $product['discount_percent'] !== null ? (int) $product['discount_percent'] : null;
$product['isFeatured'] = (bool) $product['is_featured'];
$product['isNew'] = (strtotime($product['created_at']) >= strtotime('-30 days'));
$product['category'] = $product['category_slug'];
$product['category_name'] = $product['category_name'];
$product['images'] = [];
$product['sizes'] = [];

$stmt = $pdo->prepare('SELECT id, image_path, sort_order, is_primary FROM product_images WHERE product_id = ? ORDER BY sort_order ASC, id ASC');
$stmt->execute([$product['id']]);
while ($row = $stmt->fetch()) {
    $product['images'][] = [
        'id' => (int) $row['id'],
        'path' => $row['image_path'],
        'sort_order' => (int) $row['sort_order'],
        'is_primary' => (bool) $row['is_primary']
    ];
}
$stmt = $pdo->prepare('SELECT id, size, stock, is_available FROM product_sizes WHERE product_id = ? ORDER BY id ASC');
$stmt->execute([$product['id']]);
while ($row = $stmt->fetch()) {
    $product['sizes'][] = [
        'id' => (int) $row['id'],
        'size' => $row['size'],
        'stock' => (int) $row['stock'],
        'is_available' => (bool) $row['is_available']
    ];
}
jsonResponse(['success' => true, 'data' => $product]);
