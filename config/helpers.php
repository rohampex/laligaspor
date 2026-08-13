<?php
function slugify(string $text): string
{
    $text = preg_replace('~[\p{C}\p{P}\p{S}]+~u', '', $text);
    $text = trim($text);
    $text = mb_strtolower($text, 'UTF-8');
    $text = preg_replace('/[\s_]+/u', '-', $text);
    $text = preg_replace('/[^\p{L}\p{N}-]+/u', '', $text);
    $text = preg_replace('/-+/u', '-', $text);
    return trim($text, '-') ?: bin2hex(random_bytes(4));
}

function safeHtml(string $value): string
{
    $allowed = '<p><a><strong><b><em><i><ul><ol><li><br><h2><h3><h4><blockquote><span><div>';
    return strip_tags($value, $allowed);
}

function jsonDecodeValue($value)
{
    $decoded = json_decode($value, true);
    return json_last_error() === JSON_ERROR_NONE ? $decoded : $value;
}
