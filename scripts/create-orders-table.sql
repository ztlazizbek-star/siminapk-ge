CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_phone VARCHAR(20) NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  order_type VARCHAR(20) NOT NULL,
  delivery_address TEXT,
  payment_type VARCHAR(50) NOT NULL,
  items JSON NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_phone (user_phone),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
