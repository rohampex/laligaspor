<?php
require_once __DIR__ . '/../../config/security.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}
requireAuth();
requireCsrfToken();

if (empty($_FILES['file']) || !is_uploaded_file($_FILES['file']['tmp_name'])) {
    jsonResponse(['success' => false, 'error' => 'No file uploaded'], 400);
}
$file = $_FILES['file'];
$allowedMime = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);
if (!array_key_exists($mimeType, $allowedMime)) {
    jsonResponse(['success' => false, 'error' => 'Unsupported file type'], 400);
}
if ($file['size'] > 5 * 1024 * 1024) {
    jsonResponse(['success' => false, 'error' => 'File size too large'], 400);
}
$imageInfo = getimagesize($file['tmp_name']);
if ($imageInfo === false) {
    jsonResponse(['success' => false, 'error' => 'Invalid image file'], 400);
}
$extension = $allowedMime[$mimeType];
$targetDir = dirname(__DIR__, 2) . '/uploads/images';
if (!file_exists($targetDir) && !mkdir($targetDir, 0755, true) && !is_dir($targetDir)) {
    jsonResponse(['success' => false, 'error' => 'Upload directory error'], 500);
}
$filename = bin2hex(random_bytes(16)) . '.' . $extension;
$path = $targetDir . '/' . $filename;
if (!move_uploaded_file($file['tmp_name'], $path)) {
    jsonResponse(['success' => false, 'error' => 'Unable to save file'], 500);
}
$urlPath = '/uploads/images/' . $filename;
jsonResponse(['success' => true, 'url' => $urlPath]);
