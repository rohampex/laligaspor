<?php
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../config/helpers.php';

function fetchProductDetails(array $products, PDO $pdo): array
{
    if (empty($products)) {
        return [];
    }
    $ids = array_column($products, 'id');
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $pdo->prepare("SELECT * FROM product_images WHERE product_id IN ($placeholders) ORDER BY sort_order ASC, id ASC");
    $stmt->execute($ids);
    $images = [];
    while ($row = $stmt->fetch()) {
        $images[$row['product_id']][] = [
            'id' => (int) $row['id'],
            'path' => $row['image_path'],
            'sort_order' => (int) $row['sort_order'],
            'is_primary' => (bool) $row['is_primary']
        ];
    }
    $stmt = $pdo->prepare("SELECT * FROM product_sizes WHERE product_id IN ($placeholders) ORDER BY id ASC");
    $stmt->execute($ids);
    $sizes = [];
    while ($row = $stmt->fetch()) {
        $sizes[$row['product_id']][] = [
            'id' => (int) $row['id'],
            'size' => $row['size'],
            'stock' => (int) $row['stock'],
            'is_available' => (bool) $row['is_available']
        ];
    }
    return array_map(function ($product) use ($images, $sizes) {
        $product['images'] = $images[$product['id']] ?? [];
        $product['sizes'] = $sizes[$product['id']] ?? [];
        return $product;
    }, $products);
}

function getCategoryMap(PDO $pdo): array
{
    $stmt = $pdo->query('SELECT id, slug, name FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, name ASC');
    $map = [];
    while ($row = $stmt->fetch()) {
        $map[$row['id']] = ['slug' => $row['slug'], 'name' => $row['name']];
    }
    return $map;
}

function createSlugForName(string $value): string
{
    $slug = slugify($value);
    return $slug ?: bin2hex(random_bytes(4));
}

function normalizeOffer(array $offer, PDO $pdo): array
{
    $productIds = [];
    if (!empty($offer['product_ids'])) {
        $decoded = json_decode($offer['product_ids'], true);
        if (is_array($decoded)) {
            $productIds = array_map('intval', $decoded);
        }
    }
    $offer['product_ids'] = $productIds;
    $offer['products'] = [];
    if (!empty($productIds)) {
        $placeholders = implode(',', array_fill(0, count($productIds), '?'));
        $stmt = $pdo->prepare("SELECT id, name, slug, price FROM products WHERE id IN ($placeholders) AND is_active = 1");
        $stmt->execute($productIds);
        $products = $stmt->fetchAll();
        $imagesStmt = $pdo->prepare("SELECT product_id, image_path FROM product_images WHERE product_id IN ($placeholders) ORDER BY is_primary DESC, sort_order ASC");
        $imagesStmt->execute($productIds);
        $images = [];
        while ($row = $imagesStmt->fetch()) {
            $images[$row['product_id']][] = $row['image_path'];
        }
        foreach ($products as $product) {
            $offer['products'][] = [
                'id' => (int) $product['id'],
                'name' => $product['name'],
                'slug' => $product['slug'],
                'price' => (float) $product['price'],
                'images' => $images[$product['id']] ?? []
            ];
        }
    }
    return $offer;
}

function getSiteSettings(PDO $pdo): array
{
    $stmt = $pdo->query('SELECT setting_key, setting_value FROM site_settings');
    $settings = [];
    while ($row = $stmt->fetch()) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }
    return $settings;
}

function transformSettings(array $raw): array
{
    return [
        'siteName' => $raw['siteName'] ?? '',
        'footerText' => $raw['footerText'] ?? '',
        'whatsapp' => $raw['whatsapp'] ?? '',
        'telegram' => $raw['telegram'] ?? '',
        'instagram' => $raw['instagram'] ?? '',
        'contactEmail' => $raw['contactEmail'] ?? '',
        'address' => $raw['address'] ?? '',
        'businessHours' => $raw['businessHours'] ?? '',
        'mapEmbedUrl' => $raw['mapEmbedUrl'] ?? '',
        'hero' => [
            'backgroundImage' => $raw['hero_backgroundImage'] ?? '',
            'eyebrow' => $raw['hero_eyebrow'] ?? '',
            'title' => $raw['hero_title'] ?? '',
            'titleHighlight' => $raw['hero_titleHighlight'] ?? '',
            'subtitle' => $raw['hero_subtitle'] ?? '',
            'cta1Text' => $raw['hero_cta1Text'] ?? '',
            'cta1Link' => $raw['hero_cta1Link'] ?? '',
            'cta2Text' => $raw['hero_cta2Text'] ?? '',
            'cta2Link' => $raw['hero_cta2Link'] ?? '',
        ],
        'homepage' => [
            'categoriesTitle' => $raw['homepage_categoriesTitle'] ?? '',
            'categoriesSubtitle' => $raw['homepage_categoriesSubtitle'] ?? '',
            'featuredTitle' => $raw['homepage_featuredTitle'] ?? '',
            'featuredSubtitle' => $raw['homepage_featuredSubtitle'] ?? '',
            'promoBanner' => [
                'enabled' => (bool) ($raw['homepage_promoBanner_enabled'] ?? 0),
                'image' => $raw['homepage_promoBanner_image'] ?? '',
                'title' => $raw['homepage_promoBanner_title'] ?? '',
                'link' => $raw['homepage_promoBanner_link'] ?? ''
            ]
        ]
    ];
}

function updateSiteSettings(PDO $pdo, array $data): void
{
    $stmt = $pdo->prepare('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)');
    foreach ($data as $key => $value) {
        $stmt->execute([$key, is_array($value) ? json_encode($value, JSON_UNESCAPED_UNICODE) : (string) $value]);
    }
}
