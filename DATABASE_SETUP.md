# База данных MySQL - Настройка

## Структура базы данных

Проект использует MySQL базу данных со следующими таблицами:

### 1. Таблица `admins`
\`\`\`sql
CREATE TABLE `admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=173 DEFAULT CHARSET=utf8mb4;
\`\`\`

### 2. Таблица `menu_items`
\`\`\`sql
CREATE TABLE `menu_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `top_category` varchar(50) NOT NULL,
  `subcategory` varchar(50) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4;
\`\`\`

### 3. Таблица `item_variants`
\`\`\`sql
CREATE TABLE `item_variants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) NOT NULL,
  `volume` varchar(10) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `item_id` (`item_id`),
  CONSTRAINT `item_variants_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `menu_items` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4;
\`\`\`

## Настройка подключения

В файле `api/config.php` настройте параметры подключения к базе данных:

\`\`\`php
'db_host' => 'localhost',
'db_name' => 'cg47924_simin',
'db_user' => 'cg47924_simin', 
'db_pass' => '123456789',
\`\`\`

## API Endpoints

- `GET /api/products.php` - Получить все товары с вариантами
- `GET /api/categories.php?type=main` - Получить основные категории
- `GET /api/categories.php?type=sub` - Получить подкатегории
- `GET /api/variants.php?item_id=X` - Получить варианты товара

## Установка

1. Создайте базу данных MySQL
2. Выполните SQL скрипты для создания таблиц
3. Настройте параметры подключения в `api/config.php`
4. Убедитесь, что веб-сервер поддерживает PHP
5. Разместите папку `api` в корне веб-сервера
