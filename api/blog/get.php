<?php
require_once __DIR__ . '/../../config/security.php';
$pdo = getPdo();
$slug = sanitizeText($_GET['slug'] ?? '');
if (!$slug) {
    jsonResponse(['success' => false, 'error' => 'Missing slug'], 400);
}
$stmt = $pdo->prepare('SELECT id, title, slug, excerpt, content, image, author, is_published, published_at, created_at, updated_at FROM blog_posts WHERE slug = ? LIMIT 1');
$stmt->execute([$slug]);
$post = $stmt->fetch();
if (!$post || !$post['is_published']) {
    jsonResponse(['success' => false, 'error' => 'Article not found'], 404);
}
$post['id'] = (int) $post['id'];
$post['is_published'] = (bool) $post['is_published'];
$post['content'] = safeHtml($post['content'] ?? '');
jsonResponse(['success' => true, 'data' => $post]);
