<?php
require_once __DIR__ . '/../../config/security.php';
require_once __DIR__ . '/../../config/helpers.php';
requireAuth();
requireCsrfToken();
$pdo = getPdo();
$data = getJsonInput();
$title = sanitizeText($data['title'] ?? '');
$description = sanitizeText($data['description'] ?? '');
discountPercent = isset($data['discountPercent']) && is_numeric($data['discountPercent']) ? max(0, min(99, (int)$data['discountPercent'])) : 0;
$imageUrl = sanitizeText($data['imageUrl'] ?? '');
$productIds = is_array($data['productIds']) ? array_values(array_filter(array_map('intval', $data['productIds']), fn($id) => $id > 0)) : [];
$isActive = parseBool($data['active'] ?? true);
$startAt = sanitizeText($data['startAt'] ?? date('Y-m-d H:i:s'));
$endAt = sanitizeText($data['endAt'] ?? date('Y-m-d H:i:s', strtotime('+7 days')));
if (!$title || $discountPercent <= 0 || empty($productIds)) {
    jsonResponse(['success' => false, 'error' => 'Missing required fields'], 400);
}
if (strtotime($endAt) <= strtotime($startAt)) {
    jsonResponse(['success' => false, 'error' => 'Invalid offer dates'], 400);
}
$stmt = $pdo->prepare('INSERT INTO offers (title, description, discount_percent, image_url, product_ids, start_at, end_at, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
$stmt->execute([$title, $description, $discountPercent, $imageUrl, json_encode($productIds, JSON_UNESCAPED_UNICODE), $startAt, $endAt, $isActive]);
$offerId = (int)$pdo->lastInsertId();
logSecurityEvent($pdo, $_SESSION['admin_id'], 'offer_create', "Offer {$offerId} created");
jsonResponse(['success' => true, 'data' => ['id' => $offerId]]);
