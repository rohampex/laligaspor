<?php
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../config/helpers.php';

function getPdoConnection(): PDO
{
    return getPdo();
}
