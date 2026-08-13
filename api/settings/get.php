<?php
require_once __DIR__ . '/../../config/security.php';
require_once __DIR__ . '/../../config/helpers.php';
$pdo = getPdo();
$raw = getSiteSettings($pdo);
jsonResponse(['success' => true, 'data' => transformSettings($raw)]);
