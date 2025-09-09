-- Create database tables for Cafe Simin

-- Products table
CREATE TABLE IF NOT EXISTS `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `price` varchar(50) NOT NULL,
  `image` varchar(500),
  `category` varchar(100) NOT NULL,
  `is_featured` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `category` (`category`),
  KEY `is_featured` (`is_featured`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `slug` varchar(100) NOT NULL UNIQUE,
  `name` varchar(255) NOT NULL,
  `icon` varchar(500),
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Subcategories table
CREATE TABLE IF NOT EXISTS `subcategories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `slug` varchar(100) NOT NULL UNIQUE,
  `name` varchar(255) NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default categories
INSERT INTO `categories` (`slug`, `name`, `icon`, `sort_order`) VALUES
('all', 'Всё', 'https://img.icons8.com/color/48/000000/menu--v1.png', 1),
('kids', 'Для детей', 'https://img.icons8.com/color/48/000000/duck.png', 2),
('group', 'На компанию', 'https://avatars.mds.yandex.net/i?id=f29ab152846000ab011a0b8d9c21749c5f996a3f-5229055-images-thumbs&n=13', 3),
('new', 'Новинки', 'https://img.icons8.com/color/48/000000/sparkling.png', 4),
('hot', 'Хиты', 'https://avatars.mds.yandex.net/i?id=4e2311b5083f396f4a0fdce60dd6c211972ac3f3-12644621-images-thumbs&n=13', 5);

-- Insert default subcategories
INSERT INTO `subcategories` (`slug`, `name`, `sort_order`) VALUES
('all', 'Всё', 1),
('burger', 'Бургер', 2),
('drink', 'Напитки', 3),
('combo', 'Комбо', 4),
('snack', 'Баскет', 5),
('pors', 'Порцы', 6);

-- Insert sample products
INSERT INTO `products` (`name`, `description`, `price`, `image`, `category`, `is_featured`) VALUES
('Биг Мак', 'Два мясных котлета, специальный соус, салат, сыр, соленые огурчики, лук на булочке с кунжутом', '25.50 TJS', '/big-mac-burger.jpg', 'burger', 1),
('Кока-Кола', 'Освежающий газированный напиток', '8.00 TJS', '/refreshing-cola.png', 'drink', 0),
('Картофель Фри', 'Золотистый картофель фри с хрустящей корочкой', '12.00 TJS', '/crispy-french-fries.png', 'snack', 0);
