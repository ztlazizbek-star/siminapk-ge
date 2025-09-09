<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getConnection();

switch ($method) {
    case 'GET':
        getCategories($pdo);
        break;
    case 'POST':
        createCategory($pdo);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

function getCategories($pdo) {
    try {
        $type = $_GET['type'] ?? 'top'; // 'top' or 'sub'
        
        if ($type === 'top') {
            $sql = "SELECT DISTINCT top_category as name, top_category as slug 
                    FROM menu_items 
                    WHERE top_category IS NOT NULL AND top_category != ''
                    ORDER BY top_category ASC";
        } else {
            $topCategory = $_GET['top_category'] ?? null;
            $sql = "SELECT DISTINCT subcategory as name, subcategory as slug 
                    FROM menu_items 
                    WHERE subcategory IS NOT NULL AND subcategory != ''";
            
            if ($topCategory) {
                $sql .= " AND top_category = :top_category";
            }
            
            $sql .= " ORDER BY subcategory ASC";
        }
        
        $stmt = $pdo->prepare($sql);
        if ($type === 'sub' && isset($topCategory)) {
            $stmt->execute(['top_category' => $topCategory]);
        } else {
            $stmt->execute();
        }
        $categories = $stmt->fetchAll();
        
        echo json_encode($categories);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch categories: ' . $e->getMessage()]);
    }
}

function createCategory($pdo) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        $type = $input['type'] ?? 'main';
        
        if ($type === 'main') {
            $sql = "INSERT INTO categories (slug, name, icon, sort_order) VALUES (:slug, :name, :icon, :sort_order)";
        } else {
            $sql = "INSERT INTO subcategories (slug, name, sort_order) VALUES (:slug, :name, :sort_order)";
        }
        
        $params = [
            'slug' => $input['slug'],
            'name' => $input['name'],
            'sort_order' => $input['sort_order'] ?? 0
        ];
        
        if ($type === 'main') {
            $params['icon'] = $input['icon'];
        }
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        $categoryId = $pdo->lastInsertId();
        echo json_encode(['id' => $categoryId, 'message' => 'Category created successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create category: ' . $e->getMessage()]);
    }
}
?>
