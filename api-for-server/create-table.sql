-- Создание таблицы products если её нет
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ru VARCHAR(255),
    name_tj VARCHAR(255),
    description TEXT,
    description_ru TEXT,
    description_tj TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    image VARCHAR(500),
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Пример добавления товаров
INSERT INTO products (name, name_ru, name_tj, description, description_ru, description_tj, price, category, image) VALUES
('Big Mac Burger', 'Биг Мак Бургер', 'Биг Мак Бургер', 'Delicious beef burger', 'Вкусный говяжий бургер', 'Бургери гӯшти хушмаза', 45.00, 'burgers', '/big-mac-burger.jpg'),
('Refreshing Cola', 'Освежающая Кола', 'Кола тароват', 'Cold refreshing drink', 'Холодный освежающий напиток', 'Нӯшокии хунук', 15.00, 'drinks', '/refreshing-cola.png'),
('Crispy French Fries', 'Хрустящий Картофель Фри', 'Картошкаи тарсак', 'Golden crispy fries', 'Золотистый хрустящий картофель', 'Картошкаи тилоӣ тарсак', 20.00, 'sides', '/crispy-french-fries.png');
