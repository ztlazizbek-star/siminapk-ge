<?php
// ============================================================
// SMS API для Cafe Simin - PRODUCTION VERSION
// ============================================================
// ВАЖНО: Загрузите этот файл на сервер tajstore.ru
// по пути: /simin/sms.php (замените существующий файл)
// ============================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ============================================================
// PRODUCTION MODE - Установите false для отправки реальных SMS
// ============================================================
$DEV_MODE = false; // <-- ИЗМЕНЕНО НА FALSE ДЛЯ ПРОДАКШЕНА
// ============================================================

// Получаем данные из POST запроса
$input = file_get_contents('php://input');
$data = json_decode($input, true);

$phone = isset($data['phone']) ? $data['phone'] : '';
$code = isset($data['code']) ? $data['code'] : '';
$message = isset($data['message']) ? $data['message'] : '';
$type = isset($data['type']) ? $data['type'] : 'verification';

// Логирование для отладки
error_log("[SMS API] Request received: " . json_encode($data));

// Проверка обязательных полей
if (empty($phone)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Номер телефона обязателен'
    ]);
    exit;
}

// Для верификации нужен code, для уведомлений - message
if ($type === 'verification' && empty($code)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Код подтверждения обязателен'
    ]);
    exit;
}

if ($type === 'notification' && empty($message) && empty($code)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Сообщение обязательно'
    ]);
    exit;
}

// Очистка номера телефона
$phone = preg_replace('/[^0-9]/', '', $phone);

// Убираем код страны 992 если есть
if (strpos($phone, '992') === 0) {
    $phone = substr($phone, 3);
}

// Проверка: номер должен быть 9 цифр
if (strlen($phone) !== 9) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Неверный формат номера телефона. Должно быть 9 цифр'
    ]);
    exit;
}

// Формируем текст SMS в зависимости от типа
if ($type === 'notification') {
    // Для уведомлений используем message или code как есть, БЕЗ префикса
    $sms_text = !empty($message) ? $message : $code;
} else {
    // Для верификации добавляем префикс
    $sms_text = "Ваш код подтверждения: " . $code;
}

error_log("[SMS API] Formatted SMS text: " . $sms_text);

// Режим разработки - не отправляем реальные SMS
if ($DEV_MODE) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'dev_mode' => true,
        'msg_id' => 'dev_' . uniqid(),
        'status' => 'ok',
        'phone' => $phone,
        'code' => $code,
        'message' => 'DEV MODE: SMS не отправлено, используйте код из консоли'
    ]);
    error_log("[SMS API DEV] Code for testing: " . $code);
    exit;
}

// ============================================================
// PRODUCTION MODE - Реальная отправка SMS через OsonSMS API
// ============================================================

$login = 'cafesimin'; // Ваш логин в OsonSMS
$hash_key = 'c8e879b26ba94d78b02fc2c88e70ac03'; // Ваш hash key

// Генерируем hash для аутентификации
$hash = md5($phone . $sms_text . $hash_key);

// Параметры для API OsonSMS
$api_url = 'https://api.osonsms.com/sending.php';
$params = http_build_query([
    'login' => $login,
    'phone' => $phone,
    'text' => $sms_text,
    'hash' => $hash
]);

$full_url = $api_url . '?' . $params;

error_log("[SMS API] Sending to OsonSMS: " . $full_url);

// Отправляем запрос к OsonSMS API
$response = file_get_contents($full_url);

error_log("[SMS API] OsonSMS response: " . $response);

// Обработка ответа от OsonSMS
if ($response === false) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Ошибка отправки SMS'
    ]);
    exit;
}

// OsonSMS возвращает msg_id при успешной отправке
if (strpos($response, 'msg_id') !== false) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'dev_mode' => false,
        'msg_id' => trim($response),
        'status' => 'sent',
        'phone' => $phone,
        'message' => 'SMS успешно отправлено'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Ошибка от OsonSMS: ' . $response
    ]);
}
?>
