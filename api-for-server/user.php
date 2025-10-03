<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Обработка preflight запросов
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Подключение к базе данных
$host = 'localhost';
$dbname = 'cg47924_simin';
$username = 'cg47924_simin';
$password = 'Lazizkhan#1970';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit();
}

// Получение данных запроса
$input = file_get_contents('php://input');
$data = json_decode($input, true);

$action = $data['action'] ?? '';

switch ($action) {
    case 'register':
        $name = $data['name'] ?? '';
        $phone = $data['phone'] ?? '';
        $address = $data['address'] ?? '';

        if (empty($name) || empty($phone) || empty($address)) {
            echo json_encode(['success' => false, 'error' => 'Все поля обязательны']);
            exit();
        }

        try {
            // Проверяем существует ли пользователь
            $stmt = $pdo->prepare('SELECT id FROM users WHERE phone = ?');
            $stmt->execute([$phone]);
            $existing = $stmt->fetch();

            if ($existing) {
                // Обновляем существующего пользователя
                $stmt = $pdo->prepare('UPDATE users SET name = ?, address = ? WHERE phone = ?');
                $stmt->execute([$name, $address, $phone]);
            } else {
                // Создаем нового пользователя
                $stmt = $pdo->prepare('INSERT INTO users (name, phone, address) VALUES (?, ?, ?)');
                $stmt->execute([$name, $phone, $address]);
            }

            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'error' => 'Ошибка сохранения данных']);
        }
        break;

    case 'verify':
        $phone = $data['phone'] ?? '';

        if (empty($phone)) {
            echo json_encode(['success' => false, 'error' => 'Номер телефона обязателен']);
            exit();
        }

        try {
            $stmt = $pdo->prepare('SELECT name, phone, address, profile_photo FROM users WHERE phone = ?');
            $stmt->execute([$phone]);
            $user = $stmt->fetch();

            if ($user) {
                echo json_encode([
                    'success' => true,
                    'user' => [
                        'name' => $user['name'],
                        'phone' => $user['phone'],
                        'address' => $user['address'],
                        'profilePhoto' => $user['profile_photo']
                    ]
                ]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Пользователь не найден']);
            }
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'error' => 'Ошибка проверки пользователя']);
        }
        break;

    case 'update':
        $phone = $data['phone'] ?? '';
        $name = $data['name'] ?? '';
        $address = $data['address'] ?? '';

        if (empty($phone) || empty($name) || empty($address)) {
            echo json_encode(['success' => false, 'error' => 'Все поля обязательны']);
            exit();
        }

        try {
            $stmt = $pdo->prepare('UPDATE users SET name = ?, address = ? WHERE phone = ?');
            $stmt->execute([$name, $address, $phone]);

            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Данные успешно обновлены']);
            } else {
                echo json_encode(['success' => false, 'error' => 'Пользователь не найден']);
            }
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'error' => 'Ошибка обновления данных']);
        }
        break;

    default:
        echo json_encode(['success' => false, 'error' => 'Неизвестное действие']);
        break;
}
?>
