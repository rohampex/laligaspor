<?php
require_once __DIR__ . '/../../config/security.php';
require_once __DIR__ . '/../../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$data = getJsonInput();
$username = sanitizeText($data['username'] ?? '');
$password = $data['password'] ?? '';

if (!$username || !$password) {
    jsonResponse(['success' => false, 'error' => 'Invalid username or password'], 400);
}

$pdo = getPdo();
$stmt = $pdo->prepare('SELECT * FROM admins WHERE username = ? LIMIT 1');
$stmt->execute([$username]);
$admin = $stmt->fetch();

if (!$admin) {
    jsonResponse(['success' => false, 'error' => 'Invalid username or password'], 401);
}

$lockedUntil = $admin['locked_until'] ? strtotime($admin['locked_until']) : null;
if ($lockedUntil && $lockedUntil > time()) {
    jsonResponse(['success' => false, 'error' => 'Invalid username or password'], 401);
}

if (!password_verify($password, $admin['password_hash'])) {
    $failed = (int) $admin['failed_login_attempts'] + 1;
    $lockUntil = null;
    if ($failed >= 5) {
        $lockUntil = date('Y-m-d H:i:s', time() + min(900, 60 * $failed));
    }
    $update = $pdo->prepare('UPDATE admins SET failed_login_attempts = ?, locked_until = ?, updated_at = NOW() WHERE id = ?');
    $update->execute([$failed, $lockUntil, $admin['id']]);
    logSecurityEvent($pdo, $admin['id'], 'failed_login', 'Incorrect password');
    jsonResponse(['success' => false, 'error' => 'Invalid username or password'], 401);
}

if (!(bool) $admin['is_active']) {
    jsonResponse(['success' => false, 'error' => 'Unauthorized'], 403);
}

session_regenerate_id(true);
$_SESSION['admin_id'] = (int) $admin['id'];
$_SESSION['admin_username'] = $admin['username'];
$_SESSION['admin_role'] = $admin['role'];
$_SESSION['admin_last_active'] = time();

$update = $pdo->prepare('UPDATE admins SET failed_login_attempts = 0, locked_until = NULL, last_login_at = NOW(), updated_at = NOW() WHERE id = ?');
$update->execute([$admin['id']]);
logSecurityEvent($pdo, $admin['id'], 'login_success', 'Admin logged in successfully');
jsonResponse(['success' => true, 'data' => ['username' => $admin['username'], 'role' => $admin['role']]]);
