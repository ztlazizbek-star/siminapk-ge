# Инструкции по настройке SMS на сервере

## Проблема
SMS не отправляются, потому что на сервере включен режим разработки (DEV MODE).

## Решение

Вам нужно отредактировать файл `sms.php` на сервере **tajstore.ru** по пути:
\`\`\`
/simin/sms.php
\`\`\`

### Шаг 1: Найдите строку с DEV_MODE

В файле `sms.php` найдите эту строку (должна быть в самом начале):

\`\`\`php
$DEV_MODE = true;
\`\`\`

### Шаг 2: Измените на false

Замените её на:

\`\`\`php
$DEV_MODE = false;
\`\`\`

### Шаг 3: Сохраните файл

После изменения файл должен выглядеть так:

\`\`\`php
<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ВАЖНО: Установите false для продакшена!
$DEV_MODE = false;

// ... остальной код ...
\`\`\`

## Проверка

После изменения:
1. Попробуйте зарегистрироваться в приложении
2. Вы должны получить SMS с кодом подтверждения
3. При оформлении заказа вы должны получить SMS уведомление

## Текущий код файла sms.php

Вот полный правильный код для `sms.php`:

\`\`\`php
<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ВАЖНО: Установите false для продакшена, true для тестирования
$DEV_MODE = false; // <-- Измените это на false

// Получаем данные из запроса
$input = json_decode(file_get_contents('php://input'), true);

$phone = isset($input['phone']) ? $input['phone'] : null;
$code = isset($input['code']) ? $input['code'] : null;
$message = isset($input['message']) ? $input['message'] : null;
$type = isset($input['type']) ? $input['type'] : 'verification';

// Проверяем обязательные поля
if (!$phone || (!$code && !$message)) {
    echo json_encode([
        'success' => false,
        'error' => 'Номер телефона и код обязательны'
    ]);
    exit();
}

// Очищаем номер от кода страны 992
$phone = preg_replace('/[^0-9]/', '', $phone);
if (substr($phone, 0, 3) === '992') {
    $phone = substr($phone, 3);
}

// Валидация: должно быть 9 цифр
if (strlen($phone) !== 9) {
    echo json_encode([
        'success' => false,
        'error' => 'Неверный формат номера телефона (ожидается 9 цифр)'
    ]);
    exit();
}

// Формируем текст сообщения в зависимости от типа
if ($type === 'verification') {
    // Для кодов верификации добавляем префикс
    $text = "Ваш код подтверждения: " . $code;
} else {
    // Для уведомлений используем message или code без префикса
    $text = $message ? $message : $code;
}

// Логируем запрос для отладки
error_log("SMS Request - Phone: $phone, Type: $type, Text: $text");

if ($DEV_MODE) {
    // В режиме разработки не отправляем реальные SMS
    echo json_encode([
        'success' => true,
        'dev_mode' => true,
        'msg_id' => 'dev_' . uniqid(),
        'status' => 'ok',
        'phone' => $phone,
        'code' => $code,
        'message' => 'DEV MODE: SMS не отправлено, используйте код из консоли'
    ]);
    exit();
}

// Настройки OsonSMS API
$login = 'simin';
$secret_key = '3W0JCb9H';
$hash = md5($login . $secret_key);

// Отправка SMS через OsonSMS API
$smsData = [
    'login' => $login,
    'hash' => $hash,
    'txt' => $text,
    'to' => $phone
];

$ch = curl_init('https://api.osonsms.com/sendsms.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($smsData));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Логируем ответ
error_log("OsonSMS Response - Code: $httpCode, Response: $response");

if ($httpCode === 200 && strpos($response, 'OK') !== false) {
    echo json_encode([
        'success' => true,
        'msg_id' => trim($response),
        'status' => 'sent',
        'phone' => $phone
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Ошибка отправки SMS: ' . $response
    ]);
}
?>
\`\`\`

## Важно

После изменения `$DEV_MODE = false`, SMS будут отправляться реально через OsonSMS API на указанные номера телефонов.

Убедитесь, что у вас есть баланс в аккаунте OsonSMS!
