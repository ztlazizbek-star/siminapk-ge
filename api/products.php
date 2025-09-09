<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getConnection();

switch ($method) {
    case 'GET':
        getProducts($pdo);
        break;
    case 'POST':
        createProduct($pdo);
        break;
    case 'PUT':
        updateProduct($pdo);
        break;
    case 'DELETE':
        deleteProduct($pdo);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

function getProducts($pdo) {
    try {
        $category = $_GET['category'] ?? null;
        $subcategory = $_GET['subcategory'] ?? null;
        
        $sql = "SELECT 
                    mi.id,
                    mi.name,
                    mi.description,
                    mi.top_category,
                    mi.subcategory,
                    iv.volume,
                    iv.price,
                    iv.image,
                    iv.id as variant_id
                FROM menu_items mi
                LEFT JOIN item_variants iv ON mi.id = iv.item_id
                WHERE 1=1";
        $params = [];
        
        if ($category && $category !== 'all') {
            $sql .= " AND mi.top_category = :category";
            $params['category'] = $category;
        }
        
        if ($subcategory && $subcategory !== 'all') {
            $sql .= " AND mi.subcategory = :subcategory";
            $params['subcategory'] = $subcategory;
        }
        
        $sql .= " ORDER BY mi.id DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $results = $stmt->fetchAll();
        
        $products = [];
        foreach ($results as $row) {
            $itemId = $row['id'];
            if (!isset($products[$itemId])) {
                $products[$itemId] = [
                    'id' => $row['id'],
                    'name' => $row['name'],
                    'description' => $row['description'],
                    'top_category' => $row['top_category'],
                    'subcategory' => $row['subcategory'],
                    'variants' => []
                ];
            }
            
            if ($row['variant_id']) {
                $products[$itemId]['variants'][] = [
                    'id' => $row['variant_id'],
                    'volume' => $row['volume'],
                    'price' => $row['price'],
                    'image' => $row['image']
                ];
            }
        }
        
        echo json_encode(array_values($products));
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch products: ' . $e->getMessage()]);
    }
}

function createProduct($pdo) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $sql = "INSERT INTO menu_items (name, description, top_category, subcategory) 
                VALUES (:name, :description, :top_category, :subcategory)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'name' => $input['name'],
            'description' => $input['description'],
            'top_category' => $input['top_category'],
            'subcategory' => $input['subcategory']
        ]);
        
        $productId = $pdo->lastInsertId();
        echo json_encode(['id' => $productId, 'message' => 'Product created successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create product: ' . $e->getMessage()]);
    }
}

function updateProduct($pdo) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Product ID is required']);
            return;
        }
        
        $sql = "UPDATE menu_items SET name = :name, description = :description, 
                top_category = :top_category, subcategory = :subcategory WHERE id = :id";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'id' => $id,
            'name' => $input['name'],
            'description' => $input['description'],
            'top_category' => $input['top_category'],
            'subcategory' => $input['subcategory']
        ]);
        
        echo json_encode(['message' => 'Product updated successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update product: ' . $e->getMessage()]);
    }
}

function deleteProduct($pdo) {
    try {
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Product ID is required']);
            return;
        }
        
        $sql = "DELETE FROM menu_items WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        
        echo json_encode(['message' => 'Product deleted successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete product: ' . $e->getMessage()]);
    }
}
?>
