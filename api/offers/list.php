<?php
require_once __DIR__ . '/../../config/security.php';
require_once __DIR__ . '/../../config/helpers.php';
$pdo = getPdo();
$isAdmin = isset($_GET['admin']) && $_GET['admin'] === '1';
if ($isAdmin) {
    requireAuth();
}
$now = date('Y-m-d H:i:s');
if ($isAdmin) {
    $stmt = $pdo->prepare('SELECT * FROM offers ORDER BY start_at DESC, updated_at DESC');
    $stmt->execute();
} else {
    $stmt = $pdo->prepare('SELECT * FROM offers WHERE is_active = 1 AND start_at <= ? AND end_at >= ? ORDER BY start_at DESC, updated_at DESC');
    $stmt->execute([$now, $now]);
}
$offers = [];
while ($row = $stmt->fetch()) {
    $offer = [
        'id' => (int) $row['id'],
        'title' => $row['title'],
        'description' => $row['description'],
        'discountPercent' => (int) $row['discount_percent'],
        'imageUrl' => $row['image_url'] ?? '',
        'startAt' => $row['start_at'],
        'endAt' => $row['end_at'],
        'active' => (bool) $row['is_active'],
        'productIds' => []
    ];
    $offer['product_ids'] = $row['product_ids'];
    $offers[] = normalizeOffer($offer, $pdo);
}
jsonResponse(['success' => true, 'data' => $offers]);
