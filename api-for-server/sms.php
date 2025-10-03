<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$DEV_MODE = true; // Set to false in production

// OsonSMS Configuration
$config = array(
    'login' => 'Cafe Simin',
    'hash' => '17e6c7a8ee5ae228610e0c62554aefa9',
    'sender' => 'Cafe Simin',
    'server' => 'https://api.osonsms.com/sendsms_v1.php'
);

function call_api($url, $method, $params){
    $curl = curl_init();
    $data = http_build_query($params);
    
    if ($method == "GET") {
        curl_setopt($curl, CURLOPT_URL, "$url?$data");
    }
    
    curl_setopt_array($curl, array(
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => "",
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => $method
    ));

    $response = curl_exec($curl);
    $err = curl_error($curl);
    curl_close($curl);
    
    $arr = array();
    if ($err) {
        $arr['error'] = 1;
        $arr['msg'] = $err;
    } else {
        $res = json_decode($response);
        if (isset($res->error)){
            $arr['error'] = 1;
            $arr['msg'] = "Error Code: ". $res->error->code . " Message: " . $res->error->msg;
        } else {
            $arr['error'] = 0;
            $arr['msg'] = $response;
        }
    }
    return $arr;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $phone_number = $input['phone'] ?? '';
    $code = $input['code'] ?? '';
    
    error_log("[SERVER][v0] SMS API called with phone: $phone_number code: $code");
    
    if (empty($phone_number) || empty($code)) {
        echo json_encode(['success' => false, 'error' => 'Номер телефона и код обязательны']);
        exit;
    }
    
    // Remove any non-digit characters (including +)
    $phone_number = preg_replace('/[^0-9]/', '', $phone_number);
    
    // Strip country code 992 if present
    if (substr($phone_number, 0, 3) === '992') {
        $phone_number = substr($phone_number, 3);
    }
    
    // Ensure we only use first 9 digits
    $phone_number = substr($phone_number, 0, 9);
    
    error_log("[SERVER][v0] After processing, phone: $phone_number (length: " . strlen($phone_number) . ")");
    
    // Validate phone number length
    if (strlen($phone_number) !== 9) {
        echo json_encode(['success' => false, 'error' => 'Номер должен содержать 9 цифр (получено: ' . strlen($phone_number) . ')']);
        exit;
    }
    
    if ($DEV_MODE) {
        error_log("[SERVER][v0] DEV MODE: SMS would be sent to $phone_number with code: $code");
        echo json_encode([
            'success' => true,
            'dev_mode' => true,
            'msg_id' => 'dev_' . uniqid(),
            'status' => 'ok',
            'phone' => $phone_number,
            'code' => $code,
            'message' => 'DEV MODE: SMS не отправлено, используйте код из консоли'
        ]);
        exit;
    }
    
    // Generate unique transaction ID
    $dlm = ";";
    $txn_id = uniqid();
    
    // Create hash for authentication
    $str_hash = hash('sha256', $txn_id . $dlm . $config['login'] . $dlm . $config['sender'] . $dlm . $phone_number . $dlm . $config['hash']);
    
    // Create message
    $message = "Ваш код подтверждения: " . $code;
    
    // Prepare parameters
    $params = array(
        "from" => $config['sender'],
        "phone_number" => $phone_number,
        "msg" => $message,
        "str_hash" => $str_hash,
        "txn_id" => $txn_id,
        "login" => $config['login'],
    );
    
    error_log("=== SMS REQUEST DEBUG ===");
    error_log("Phone: $phone_number");
    error_log("Code: $code");
    error_log("TxnID: $txn_id");
    error_log("Login: " . $config['login']);
    error_log("Sender: " . $config['sender']);
    error_log("Hash: $str_hash");
    error_log("Full URL: " . $config['server'] . "?" . http_build_query($params));
    
    // Send SMS via OsonSMS API
    $result = call_api($config['server'], "GET", $params);
    
    error_log("[SERVER][v0] SMS Response: " . json_encode($result));
    
    error_log("=== END DEBUG ===");
    
    if ((isset($result['error']) && $result['error'] == 0)) {
        $response = json_decode($result['msg']);
        echo json_encode([
            'success' => true,
            'msg_id' => $response->msg_id ?? null,
            'status' => $response->status ?? 'ok',
            'phone' => $phone_number
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => $result['msg'] ?? 'Ошибка отправки SMS',
            'debug_info' => [
                'login' => $config['login'],
                'phone' => $phone_number,
                'message' => 'Проверьте учетные данные OsonSMS у администратора'
            ]
        ]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Метод не поддерживается']);
}
?>
