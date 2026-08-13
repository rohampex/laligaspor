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
$stmt = $pdo->prepare('SELECT * FROM products WHERE id = ? LIMIT 1');
$stmt->execute([$id]);
$product = $stmt->fetch();
if (!$product) {
    jsonResponse(['success' => false, 'error' => 'Product not found'], 404);
}
$newSlug = slugify($product['name'] . '-' . bin2hex(random_bytes(2)));
$stmt = $pdo->prepare('INSERT INTO products (name, slug, description, short_description, category_id, price, discount_price, discount_percent, sku, barcode, brand, team, season, is_featured, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
$stmt->execute([
    $product['name'], $newSlug, $product['description'], $product['short_description'], $product['category_id'], $product['price'], $product['discount_price'], $product['discount_percent'], $product['sku'], $product['barcode'], $product['brand'], $product['team'], $product['season'], $product['is_featured'], $product['is_active']
]);
$newProductId = (int) $pdo->lastInsertId();
$stmt = $pdo->prepare('SELECT image_path, sort_order, is_primary FROM product_images WHERE product_id = ?');
$stmt->execute([$id]);
while ($row = $stmt->fetch()) {
    $insert = $pdo->prepare('INSERT INTO product_images (product_id, image_path, sort_order, is_primary) VALUES (?, ?, ?, ?)');
    $insert->execute([$newProductId, $row['image_path'], $row['sort_order'], $row['is_primary']]);
}
$stmt = $pdo->prepare('SELECT size, stock, is_available FROM product_sizes WHERE product_id = ?');
$stmt->execute([$id]);
while ($row = $stmt->fetch()) {
    $insert = $pdo->prepare('INSERT INTO product_sizes (product_id, size, stock, is_available) VALUES (?, ?, ?, ?)');
    $insert->execute([$newProductId, $row['size'], $row['stock'], $row['is_available']]);
}
logSecurityEvent($pdo, $_SESSION['admin_id'], 'product_duplicate', "Product {$id} duplicated to {$newProductId}");
jsonResponse(['success' => true, 'data' => ['id' => $newProductId]]);
