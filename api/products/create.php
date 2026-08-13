<?php
require_once __DIR__ . '/../../config/security.php';
require_once __DIR__ . '/../../config/helpers.php';
requireAuth();
requireCsrfToken();
$pdo = getPdo();
$data = getJsonInput();
$name = sanitizeText($data['name'] ?? '');
$slug = sanitizeSlug($data['slug'] ?? $name);
$categorySlug = sanitizeText($data['category'] ?? '');
$price = is_numeric($data['price'] ?? null) ? (float) $data['price'] : null;
$originalPrice = is_numeric($data['originalPrice'] ?? null) ? (float) $data['originalPrice'] : null;
$stock = max(0, (int) ($data['stock'] ?? 0));
$isFeatured = parseBool($data['isFeatured'] ?? false);
$isActive = parseBool($data['isActive'] ?? true);
$description = sanitizeText($data['description'] ?? '');
$shortDescription = sanitizeText($data['short_description'] ?? '');
$sku = sanitizeText($data['sku'] ?? '');
$barcode = sanitizeText($data['barcode'] ?? '');
$brand = sanitizeText($data['brand'] ?? '');
$team = sanitizeText($data['team'] ?? '');
$season = sanitizeText($data['season'] ?? '');
$images = is_array($data['images']) ? array_filter(array_map('sanitizeText', $data['images'])) : [];
$sizes = is_array($data['sizes']) ? $data['sizes'] : [];
if (!$name || !$slug || $price === null || $price < 0) {
    jsonResponse(['success' => false, 'error' => 'Missing required fields'], 400);
}
$stmt = $pdo->prepare('SELECT id FROM categories WHERE slug = ? LIMIT 1');
stmt->execute([$categorySlug]);
$category = $stmt->fetch();
if (!$category) {
    jsonResponse(['success' => false, 'error' => 'Invalid category'], 400);
}
$categoryId = (int) $category['id'];
$discountPercent = null;
$discountPrice = null;
if ($originalPrice !== null && $originalPrice > $price) {
    $discountPercent = (int) round((1 - $price / $originalPrice) * 100);
    $discountPrice = $price;
}
$stmt = $pdo->prepare('INSERT INTO products (name, slug, description, short_description, category_id, price, discount_price, discount_percent, sku, barcode, brand, team, season, is_featured, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
$stmt->execute([$name, $slug, $description, $shortDescription, $categoryId, $price, $discountPrice, $discountPercent, $sku, $barcode, $brand, $team, $season, $isFeatured, $isActive]);
$productId = (int) $pdo->lastInsertId();
$productImages = array_values(array_unique($images));
foreach ($productImages as $sort => $imagePath) {
    $stmt = $pdo->prepare('INSERT INTO product_images (product_id, image_path, sort_order, is_primary) VALUES (?, ?, ?, ?)');
    $stmt->execute([$productId, $imagePath, $sort, $sort === 0 ? 1 : 0]);
}
foreach ($sizes as $item) {
    if (empty($item['value'])) {
        continue;
    }
    $size = sanitizeText($item['value']);
    $stockValue = max(0, (int) ($item['stock'] ?? 0));
    $available = parseBool($item['available'] ?? ($stockValue > 0));
    $stmt = $pdo->prepare('INSERT INTO product_sizes (product_id, size, stock, is_available) VALUES (?, ?, ?, ?)');
    $stmt->execute([$productId, $size, $stockValue, $available]);
}
logSecurityEvent($pdo, $_SESSION['admin_id'], 'product_create', "Product {$productId} created: {$name}");
jsonResponse(['success' => true, 'data' => ['id' => $productId]]);
