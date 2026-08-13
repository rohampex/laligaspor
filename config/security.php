<?php
if (session_status() === PHP_SESSION_NONE) {
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
    session_name('ll_sess');
    session_set_cookie_params([
        'httponly' => true,
        'secure' => $secure,
        'samesite' => 'Lax',
        'path' => '/',
    ]);
    session_start();
}

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer-when-downgrade');
header('X-Frame-Options: DENY');
header('Permissions-Policy: interest-cohort=()');
if (!headers_sent()) {
    header('Content-Type: application/json; charset=utf-8');
}

function jsonResponse(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function getPdo(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    $config = require __DIR__ . '/database.php';
    $dsn = sprintf('mysql:host=%s;dbname=%s;charset=%s', $config['host'], $config['database'], $config['charset']);
    $pdo = new PDO($dsn, $config['username'], $config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    return $pdo;
}

function getJsonInput(): array
{
    $input = json_decode(file_get_contents('php://input'), true);
    return is_array($input) ? $input : [];
}

function getPostValue(string $key, $default = null)
{
    return $_POST[$key] ?? $default;
}

function getRequestValue(string $key, $default = null)
{
    if (isset($_POST[$key])) {
        return $_POST[$key];
    }
    $input = getJsonInput();
    return $input[$key] ?? $_GET[$key] ?? $default;
}

function ipAddress(): string
{
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        return $_SERVER['HTTP_CLIENT_IP'];
    }
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        return trim(explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0]);
    }
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

function userAgent(): string
{
    return $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
}

function generateCsrfToken(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verifyCsrfToken(string $token): void
{
    if (empty($token) || empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $token)) {
        jsonResponse(['success' => false, 'error' => 'Invalid CSRF token'], 403);
    }
}

function requireCsrfToken(): void
{
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? ($_POST['csrf_token'] ?? getJsonInput()['csrf_token'] ?? '');
    verifyCsrfToken($token);
}

function logoutSession(): void
{
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    session_destroy();
}

function requireAuth(): void
{
    $timeout = 1800;
    if (empty($_SESSION['admin_id']) || empty($_SESSION['admin_last_active']) || (time() - $_SESSION['admin_last_active']) > $timeout) {
        logoutSession();
        jsonResponse(['success' => false, 'error' => 'Unauthorized'], 401);
    }
    $_SESSION['admin_last_active'] = time();
}

function sanitizeText($value): string
{
    return trim((string) $value);
}

function sanitizeSlug($value): string
{
    $slug = trim(mb_strtolower(preg_replace('/[^a-z0-9\p{Arabic}\s-]/u', '', str_replace(['_', '٫'], '-', $value))));
    $slug = preg_replace('/[\s-]+/', '-', $slug);
    return trim($slug, '-');
}

function parseBool($value): bool
{
    if (is_bool($value)) {
        return $value;
    }
    if (is_numeric($value)) {
        return (int) $value !== 0;
    }
    return in_array(strtolower(trim((string) $value)), ['1', 'true', 'yes', 'on'], true);
}

function logSecurityEvent(PDO $pdo, ?int $adminId, string $event, string $details = ''): void
{
    $stmt = $pdo->prepare('INSERT INTO security_logs (admin_id, event, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$adminId, $event, $details, ipAddress(), userAgent()]);
}
