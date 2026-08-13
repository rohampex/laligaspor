<?php
require_once __DIR__ . '/../../config/security.php';
require_once __DIR__ . '/../../config/helpers.php';
requireAuth();
requireCsrfToken();
$pdo = getPdo();
$data = getJsonInput();
$title = sanitizeText($data['title'] ?? '');
$slug = sanitizeSlug($data['slug'] ?? $title);
$excerpt = sanitizeText($data['excerpt'] ?? '');
$content = safeHtml($data['content'] ?? '');
$category = sanitizeText($data['category'] ?? '');
$featuredImage = sanitizeText($data['featuredImage'] ?? '');
$status = sanitizeText($data['status'] ?? 'draft');
$tags = is_array($data['tags']) ? array_values(array_filter(array_map('sanitizeText', $data['tags']))) : [];
if (!$title || !$slug || !$excerpt) {
    jsonResponse(['success' => false, 'error' => 'Missing required fields'], 400);
}
$stmt = $pdo->prepare('INSERT INTO blog_posts (title, slug, excerpt, content, image, author, is_published, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
$isPublished = $status === 'published' ? 1 : 0;
$publishedAt = $isPublished ? date('Y-m-d H:i:s') : null;
$stmt->execute([$title, $slug, $excerpt, $content, $featuredImage, 'تیم لالیگا', $isPublished, $publishedAt]);
$postId = (int) $pdo->lastInsertId();
logSecurityEvent($pdo, $_SESSION['admin_id'], 'blog_create', "Blog {$postId} created: {$title}");
jsonResponse(['success' => true, 'data' => ['id' => $postId]]);
