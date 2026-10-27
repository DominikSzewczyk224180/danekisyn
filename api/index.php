<?php
/* ==========================================================================
   API: Samochody Danek & Syn  (api.samochodydanekisyn.pl)
   Oferta aut, galeria, opinie i zdjęcia dla strony oraz panelu admina.
   Wymaga PHP 7.4+ (z rozszerzeniami json, fileinfo). Dane w plikach JSON.

   Trasy (index.php?r=...  albo  /...  przy włączonym mod_rewrite):
     GET    status            stan API
     GET    oferta            oferta (publicznie, dla strony)
     POST   login             { password }            -> { token, expires }
     POST   logout                                     (z tokenem)
     PUT    oferta            { cars, gallery, reviews, baseVersion }  (z tokenem)
     POST   zdjecia           multipart: plik          -> { url }      (z tokenem)
   Token: nagłówek X-Auth-Token (albo Authorization: Bearer ...).
   ========================================================================== */
declare(strict_types=1);

$CFG = require __DIR__ . '/config.php';
define('DATA', rtrim((string)$CFG['data_dir'], '/'));
define('UPLOADS', rtrim((string)$CFG['uploads_dir'], '/'));
define('UPLOADS_URL', rtrim((string)$CFG['public_uploads_url'], '/'));
define('SESSION_TTL', 12 * 3600);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
header('Cache-Control: no-store');

/* ---------- CORS: tylko strona komisu ---------- */
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && in_array($origin, (array)$CFG['allowed_origins'], true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Headers: Content-Type, X-Auth-Token, Authorization');
    header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
    header('Access-Control-Max-Age: 600');
}
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') { http_response_code(204); exit; }

/* ---------- Narzędzia ---------- */
function out($data, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function fail(string $msg, int $code): void { out(['error' => $msg], $code); }
function body(): array
{
    $raw = (string)file_get_contents('php://input');
    if (strlen($raw) > 3000000) fail('Za dużo danych', 413);
    $j = json_decode($raw === '' ? 'null' : $raw, true);
    return is_array($j) ? $j : [];
}
function ensure_dirs(): void
{
    foreach ([DATA, DATA . '/backups', UPLOADS] as $d) {
        if (!is_dir($d) && !@mkdir($d, 0755, true)) fail('Brak uprawnień do zapisu na serwerze', 500);
    }
}
function read_json(string $file, $default)
{
    if (!is_file($file)) return $default;
    $j = json_decode((string)file_get_contents($file), true);
    return $j === null ? $default : $j;
}
function write_json(string $file, $data): void
{
    $tmp = $file . '.' . bin2hex(random_bytes(4)) . '.tmp';
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if ($json === false || file_put_contents($tmp, $json, LOCK_EX) === false || !rename($tmp, $file)) {
        @unlink($tmp);
        fail('Nie udało się zapisać danych na serwerze', 500);
    }
}
function lock_data()
{
    $fh = fopen(DATA . '/.lock', 'c');
    if (!$fh || !flock($fh, LOCK_EX)) fail('Serwer jest zajęty, spróbuj za chwilę', 503);
    return $fh; // zwolni się na końcu żądania
}
function client_ip(): string { return (string)($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'); }
function current_hash(array $CFG): string
{
    return (string)$CFG['password_hash'];   // hasło zmienia się tylko w config.php
}
function active_sessions(): array
{
    $now = time();
    return array_filter(read_json(DATA . '/sessions.json', []), function ($v) use ($now) { return ($v['exp'] ?? 0) > $now; });
}
function request_token(): string
{
    $t = (string)($_SERVER['HTTP_X_AUTH_TOKEN'] ?? '');
    if ($t === '') {
        $h = (string)($_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? ''));
        if (preg_match('/^Bearer\s+(\S+)$/i', $h, $m)) $t = $m[1];
    }
    return preg_match('/^[a-f0-9]{64}$/', $t) ? $t : '';
}
function require_auth(): string
{
    $t = request_token();
    if ($t === '') fail('Zaloguj się, żeby zapisywać zmiany', 401);
    $key = hash('sha256', $t);
    if (!isset(active_sessions()[$key])) fail('Sesja wygasła, zaloguj się ponownie', 401);
    return $key;
}

/* ---------- Porządkowanie danych z panelu ---------- */
function s($v, int $max): string
{
    $v = trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', (string)$v) ?? '');
    return function_exists('mb_substr') ? mb_substr($v, 0, $max) : substr($v, 0, $max);
}
function img_ok($u): bool
{
    if (!is_string($u)) return false;
    if (preg_match('#^assets/img/[A-Za-z0-9_\-/.]+\.(webp|jpe?g|png)$#', $u) && strpos($u, '..') === false) return true;
    return strpos($u, UPLOADS_URL . '/') === 0 && preg_match('#^[A-Za-z0-9_\-/.:]+$#', $u) && strpos($u, '..') === false;
}
function clean_car(array $c): ?array
{
    $id = strtolower(s($c['id'] ?? '', 80));
    if (!preg_match('/^[a-z0-9][a-z0-9-]{0,79}$/', $id)) return null;
    $out = ['id' => $id];
    foreach (['make' => 60, 'model' => 80, 'version' => 160, 'fuel' => 40, 'gearbox' => 40, 'gearboxNote' => 120,
              'drive' => 80, 'body' => 80, 'color' => 80, 'origin' => 80, 'description' => 5000,
              'imageAlt' => 200, 'imagePos' => 40] as $k => $max) {
        if (isset($c[$k]) && s($c[$k], $max) !== '') $out[$k] = s($c[$k], $max);
    }
    foreach (['year', 'mileage', 'engine', 'power', 'price'] as $k) {
        if (isset($c[$k]) && is_numeric($c[$k])) $out[$k] = (int)round((float)$c[$k]);
    }
    if (!empty($c['negotiable'])) $out['negotiable'] = true;
    if (!empty($c['hidden'])) $out['hidden'] = true;
    $facts = [];
    foreach ((array)($c['facts'] ?? []) as $k => $v) {
        if (!preg_match('/^[A-Za-z]{2,30}$/', (string)$k)) continue;
        if ($v === true) $facts[$k] = true;
        elseif (is_string($v) && s($v, 60) !== '') $facts[$k] = s($v, 60);
    }
    $out['facts'] = (object)$facts;
    $out['highlights'] = array_values(array_slice(array_filter(array_map(function ($h) { return s($h, 120); }, (array)($c['highlights'] ?? [])), 'strlen'), 0, 60));
    $out['images'] = array_values(array_slice(array_filter((array)($c['images'] ?? []), 'img_ok'), 0, 40));
    $oto = s($c['otomoto'] ?? '', 500);
    if (preg_match('#^https://[^\s"<>]+$#', $oto)) $out['otomoto'] = $oto;
    return $out;
}
function clean_offer(array $b): array
{
    $cars = []; $seen = [];
    foreach (array_slice((array)$b['cars'], 0, 400) as $c) {
        if (!is_array($c) || !($cc = clean_car($c)) || isset($seen[$cc['id']])) continue;
        $seen[$cc['id']] = true; $cars[] = $cc;
    }
    $gallery = array_values(array_slice(array_filter((array)$b['gallery'], 'img_ok'), 0, 600));
    $reviews = [];
    foreach (array_slice((array)$b['reviews'], 0, 200) as $r) {
        if (!is_array($r) || s($r['author'] ?? '', 80) === '' || s($r['text'] ?? '', 2000) === '') continue;
        $rr = ['author' => s($r['author'], 80), 'text' => s($r['text'], 2000)];
        if (s($r['car'] ?? '', 80) !== '') $rr['car'] = s($r['car'], 80);
        $reviews[] = $rr;
    }
    return ['cars' => $cars, 'gallery' => $gallery, 'reviews' => $reviews];
}
// zdjęcia, których nie używa żadne auto ani galeria, kasujemy po dobie (świeże mogą czekać w otwartym edytorze)
function cleanup_uploads(array $offer): void
{
    $used = [];
    foreach ($offer['cars'] as $c) foreach ($c['images'] as $u) $used[$u] = true;
    foreach ($offer['gallery'] as $u) $used[$u] = true;
    if (!is_dir(UPLOADS)) return;
    $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(UPLOADS, FilesystemIterator::SKIP_DOTS));
    foreach ($it as $f) {
        if (!$f->isFile() || !preg_match('/\.(webp|jpe?g|png)$/', $f->getFilename())) continue;
        $url = UPLOADS_URL . substr(str_replace('\\', '/', $f->getPathname()), strlen(UPLOADS));
        if (!isset($used[$url]) && $f->getMTime() < time() - 86400) @unlink($f->getPathname());
    }
}
function prune_backups(int $keep): void
{
    $files = glob(DATA . '/backups/oferta-*.json') ?: [];
    sort($files);
    foreach (array_slice($files, 0, max(0, count($files) - $keep)) as $f) @unlink($f);
}

/* ---------- Routing ---------- */
$route = (string)($_GET['r'] ?? '');
if ($route === '') {
    $path = (string)parse_url((string)($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH);
    $route = (string)preg_replace('#^.*/index\.php#', '', $path);
}
$route = strtolower(trim($route, '/'));
$method = (string)($_SERVER['REQUEST_METHOD'] ?? 'GET');
ensure_dirs();

if ($route === '' || $route === 'status') {
    $o = read_json(DATA . '/oferta.json', ['version' => 0]);
    out(['ok' => true, 'version' => (int)($o['version'] ?? 0), 'php' => PHP_VERSION]);
}

if ($route === 'oferta' && $method === 'GET') {
    $o = read_json(DATA . '/oferta.json', null);
    if ($o === null) out(['empty' => true, 'version' => 0]);
    header('Cache-Control: no-cache');
    out($o);
}

if ($route === 'login' && $method === 'POST') {
    $b = body();
    $pw = (string)($b['password'] ?? '');
    $lock = lock_data();
    $now = time(); $ip = client_ip();
    $rl = array_filter(read_json(DATA . '/ratelimit.json', []), function ($v) use ($now) { return $now - ($v['first'] ?? 0) < 900; });
    if (($rl[$ip]['count'] ?? 0) >= 5) { write_json(DATA . '/ratelimit.json', $rl); fail('Za dużo nieudanych prób. Spróbuj ponownie za 15 minut.', 429); }
    if ($pw === '' || !password_verify($pw, current_hash($CFG))) {
        $rl[$ip] = ['count' => ($rl[$ip]['count'] ?? 0) + 1, 'first' => $rl[$ip]['first'] ?? $now];
        write_json(DATA . '/ratelimit.json', $rl);
        usleep(400000);
        fail('Nieprawidłowe hasło', 401);
    }
    unset($rl[$ip]);
    write_json(DATA . '/ratelimit.json', $rl);
    $token = bin2hex(random_bytes(32));
    $sessions = active_sessions();
    $sessions[hash('sha256', $token)] = ['exp' => $now + SESSION_TTL];
    write_json(DATA . '/sessions.json', $sessions);
    out(['token' => $token, 'expires' => $now + SESSION_TTL]);
}

if ($route === 'logout' && $method === 'POST') {
    $t = request_token();
    if ($t !== '') {
        $lock = lock_data();
        $sessions = active_sessions();
        unset($sessions[hash('sha256', $t)]);
        write_json(DATA . '/sessions.json', $sessions);
    }
    out(['ok' => true]);
}

if ($route === 'oferta' && ($method === 'PUT' || $method === 'POST')) {
    require_auth();
    $b = body();
    foreach (['cars', 'gallery', 'reviews'] as $k) {
        if (!isset($b[$k]) || !is_array($b[$k])) fail('Niepełne dane: brak ' . $k, 400);
    }
    $lock = lock_data();
    $cur = read_json(DATA . '/oferta.json', ['version' => 0]);
    $curVersion = (int)($cur['version'] ?? 0);
    if ((int)($b['baseVersion'] ?? -1) !== $curVersion) {
        fail('Oferta została w międzyczasie zmieniona na innym urządzeniu. Wczytuję najnowszą wersję.', 409);
    }
    if (is_file(DATA . '/oferta.json')) {
        copy(DATA . '/oferta.json', DATA . '/backups/oferta-' . date('Ymd-His') . '-v' . $curVersion . '.json');
        prune_backups(40);
    }
    $offer = clean_offer($b);
    $new = ['version' => $curVersion + 1, 'updatedAt' => (int)round(microtime(true) * 1000)] + $offer;
    write_json(DATA . '/oferta.json', $new);
    cleanup_uploads($offer);
    out(['version' => $new['version'], 'updatedAt' => $new['updatedAt'], 'cars' => count($offer['cars'])]);
}

if ($route === 'zdjecia' && $method === 'POST') {
    require_auth();
    $f = $_FILES['plik'] ?? null;
    if (!$f || ($f['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) fail('Nie udało się wysłać pliku', 400);
    if ($f['size'] > 8 * 1024 * 1024) fail('Plik jest za duży (maks. 8 MB)', 413);
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);
    $ext = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'][$mime] ?? null;
    if ($ext === null || @getimagesize($f['tmp_name']) === false) fail('To nie jest obsługiwany obraz (JPG, PNG albo WebP)', 415);
    $sub = date('Y') . '/' . date('m');
    $dir = UPLOADS . '/' . $sub;
    if (!is_dir($dir) && !@mkdir($dir, 0755, true)) fail('Brak uprawnień do zapisu zdjęć', 500);
    $name = bin2hex(random_bytes(12)) . '.' . $ext;
    if (!move_uploaded_file($f['tmp_name'], $dir . '/' . $name)) fail('Nie udało się zapisać zdjęcia', 500);
    @chmod($dir . '/' . $name, 0644);
    out(['url' => UPLOADS_URL . '/' . $sub . '/' . $name], 201);
}

fail('Nie ma takiej trasy', 404);
