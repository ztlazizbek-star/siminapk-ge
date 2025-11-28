<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ВАЖНО: Установите false для продакшена!
$DEV_MODE = false;

// Получаем данные из POST запроса
$data = json_decode(file_get_contents('php://input'), true);

$phone = isset($data['phone']) ? $data['phone'] : '';
$code = isset($data['code']) ? $data['code'] : '';
$message = isset($data['message']) ? $data['message'] : '';
$type = isset($data['type']) ? $data['type'] : 'verification';

// Определяем текст SMS
if (!empty($message)) {
    // Используем message для уведомлений (без префикса)
    $smsText = $message;
} else if (!empty($code)) {
    // Используем code для верификации
    if ($type === 'notification') {
        // Уведомление о заказе - без префикса
        $smsText = $code;
    } else {
        // Код подтверждения - с префиксом
        $smsText = "Ваш код подтверждения: " . $code;
    }
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Номер телефона и код/сообщение обязательны'
    ]);
    exit;
}

// Нормализация номера телефона (убираем код страны 992)
$phone = preg_replace('/^\+?992/', '', $phone);
$phone = preg_replace('/[^0-9]/', '', $phone);

// Валидация номера (должно быть ровно 9 цифр)
if (strlen($phone) !== 9) {
    echo json_encode([
        'success' => false,
        'error' => 'Номер телефона должен содержать 9 цифр'
    ]);
    exit;
}

// Логирование запроса
error_log("[SMS API] Phone: $phone, Type: $type, Text: $smsText");

// В режиме разработки не отправляем SMS
if ($DEV_MODE) {
    echo json_encode([
        'success' => true,
        'dev_mode' => true,
        'msg_id' => 'dev_' . uniqid(),
        'status' => 'ok',
        'phone' => $phone,
        'code' => $code,
        'message' => 'DEV MODE: SMS не отправлено, используйте код из консоли'
    ]);
    exit;
}

// Конфигурация OsonSMS API
$login = 'YOUR_LOGIN';
$secret = 'YOUR_SECRET_KEY';
$hash = md5($phone . $smsText . $secret);

// Параметры для отправки SMS
$params = [
    'login' => $login,
    'from' => 'Cafe Simin',
    'message' => $smsText,
    'phone' => $phone,
    'hash' => $hash
];

// Отправка SMS через OsonSMS API
$ch = curl_init('https://api.osonsms.com/sendsms.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// Логирование ответа
error_log("[SMS API] Response code: $httpCode, Response: $response");

if ($curlError) {
    echo json_encode([
        'success' => false,
        'error' => 'Ошибка отправки SMS: ' . $curlError
    ]);
    exit;
}

$result = json_decode($response, true);

if ($httpCode === 200 && isset($result['msg_id'])) {
    echo json_encode([
        'success' => true,
        'msg_id' => $result['msg_id'],
        'status' => 'ok',
        'phone' => $phone
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => $result['error'] ?? 'Неизвестная ошибка при отправке SMS',
        'response' => $result
    ]);
}
?>
