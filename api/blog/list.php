<?php
require_once __DIR__ . '/../../config/security.php';
$pdo = getPdo();
$isAdmin = isset($_GET['admin']) && $_GET['admin'] === '1';
if ($isAdmin) {
    requireAuth();
}
$sql = 'SELECT id, title, slug, excerpt, image, author, is_published, published_at, created_at, updated_at FROM blog_posts';
$params = [];
if (!$isAdmin) {
    $sql .= ' WHERE is_published = 1';
}
$sql .= ' ORDER BY published_at DESC, updated_at DESC LIMIT 100';
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$posts = [];
while ($row = $stmt->fetch()) {
    $posts[] = [
        'id' => (int) $row['id'],
        'title' => $row['title'],
        'slug' => $row['slug'],
        'excerpt' => $row['excerpt'],
        'image' => $row['image'],
        'author' => $row['author'],
        'status' => $row['is_published'] ? 'published' : 'draft',
        'publishedAt' => $row['published_at'],
        'createdAt' => $row['created_at'],
        'updatedAt' => $row['updated_at']
    ];
}
jsonResponse(['success' => true, 'data' => $posts]);
