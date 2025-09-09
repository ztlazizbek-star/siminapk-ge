<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getConnection();

switch ($method) {
    case 'GET':
        getVariants($pdo);
        break;
    case 'POST':
        createVariant($pdo);
        break;
    case 'PUT':
        updateVariant($pdo);
        break;
    case 'DELETE':
        deleteVariant($pdo);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

function getVariants($pdo) {
    try {
        $itemId = $_GET['item_id'] ?? null;
        
        $sql = "SELECT * FROM item_variants WHERE 1=1";
        $params = [];
        
        if ($itemId) {
            $sql .= " AND item_id = :item_id";
            $params['item_id'] = $itemId;
        }
        
        $sql .= " ORDER BY id ASC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $variants = $stmt->fetchAll();
        
        echo json_encode($variants);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch variants: ' . $e->getMessage()]);
    }
}

function createVariant($pdo) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $sql = "INSERT INTO item_variants (item_id, volume, price, image) 
                VALUES (:item_id, :volume, :price, :image)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'item_id' => $input['item_id'],
            'volume' => $input['volume'],
            'price' => $input['price'],
            'image' => $input['image']
        ]);
        
        $variantId = $pdo->lastInsertId();
        echo json_encode(['id' => $variantId, 'message' => 'Variant created successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create variant: ' . $e->getMessage()]);
    }
}

function updateVariant($pdo) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Variant ID is required']);
            return;
        }
        
        $sql = "UPDATE item_variants SET volume = :volume, price = :price, image = :image WHERE id = :id";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'id' => $id,
            'volume' => $input['volume'],
            'price' => $input['price'],
            'image' => $input['image']
        ]);
        
        echo json_encode(['message' => 'Variant updated successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update variant: ' . $e->getMessage()]);
    }
}

function deleteVariant($pdo) {
    try {
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Variant ID is required']);
            return;
        }
        
        $sql = "DELETE FROM item_variants WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        
        echo json_encode(['message' => 'Variant deleted successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete variant: ' . $e->getMessage()]);
    }
}
?>
