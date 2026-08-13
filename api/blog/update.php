<?php
require_once __DIR__ . '/../../config/security.php';
require_once __DIR__ . '/../../config/helpers.php';
requireAuth();
requireCsrfToken();
$pdo = getPdo();
$data = getJsonInput();
$id = isset($data['id']) ? (int) $data['id'] : 0;
if ($id <= 0) {
    jsonResponse(['success' => false, 'error' => 'Invalid blog id'], 400);
}
$title = sanitizeText($data['title'] ?? '');
$slug = sanitizeSlug($data['slug'] ?? $title);
$excerpt = sanitizeText($data['excerpt'] ?? '');
$content = safeHtml($data['content'] ?? '');
$category = sanitizeText($data['category'] ?? '');
$featuredImage = sanitizeText($data['featuredImage'] ?? '');
$status = sanitizeText($data['status'] ?? 'draft');
if (!$title || !$slug || !$excerpt) {
    jsonResponse(['success' => false, 'error' => 'Missing required fields'], 400);
}
$isPublished = $status === 'published' ? 1 : 0;
$publishedAt = $isPublished ? date('Y-m-d H:i:s') : null;
$stmt = $pdo->prepare('UPDATE blog_posts SET title = ?, slug = ?, excerpt = ?, content = ?, image = ?, author = ?, is_published = ?, published_at = ?, updated_at = NOW() WHERE id = ?');
$stmt->execute([$title, $slug, $excerpt, $content, $featuredImage, 'تیم لالیگا', $isPublished, $publishedAt, $id]);
logSecurityEvent($pdo, $_SESSION['admin_id'], 'blog_update', "Blog {$id} updated: {$title}");
jsonResponse(['success' => true]);
