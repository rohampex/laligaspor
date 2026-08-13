<?php
require_once __DIR__ . '/../../config/security.php';
require_once __DIR__ . '/../../config/helpers.php';
requireAuth();
requireCsrfToken();
$pdo = getPdo();
$data = getJsonInput();
$settings = [];
foreach ($data as $key => $value) {
    if (!is_string($key)) {
        continue;
    }
    $settings[$key] = is_array($value) ? json_encode($value, JSON_UNESCAPED_UNICODE) : sanitizeText($value);
}
if (empty($settings)) {
    jsonResponse(['success' => false, 'error' => 'No settings provided'], 400);
}
$stmt = $pdo->prepare('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)');
foreach ($settings as $key => $value) {
    $stmt->execute([$key, $value]);
}
logSecurityEvent($pdo, $_SESSION['admin_id'], 'settings_update', 'Site settings updated');
jsonResponse(['success' => true]);
