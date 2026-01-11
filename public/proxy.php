<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$url = $_GET['url'] ?? '';
if (!$url || !filter_var($url, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    exit('Invalid URL');
}

$scheme = parse_url($url, PHP_URL_SCHEME);
if (!in_array($scheme, ['http', 'https'])) {
    http_response_code(400);
    exit('Only http/https allowed');
}

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 5,
    CURLOPT_TIMEOUT => 15,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_USERAGENT => 'DocSignals/1.0',
    CURLOPT_HTTPHEADER => ['Accept: text/html,*/*'],
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_ENCODING => '',
    CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
]);

$response = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$type = curl_getinfo($ch, CURLINFO_CONTENT_TYPE) ?: 'text/html';
$err = curl_errno($ch);
curl_close($ch);

if ($err) {
    http_response_code(502);
    exit('Proxy error');
}

http_response_code($code);
header('Content-Type: ' . $type);
echo $response;
