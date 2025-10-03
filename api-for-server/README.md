# API для tajstore.ru/simin

## Инструкция по установке

1. **Загрузите файл `index.php`** на ваш сервер в папку `/simin/`
   - Полный путь должен быть: `tajstore.ru/simin/index.php`

2. **Создайте таблицу в базе данных**
   - Откройте phpMyAdmin или другой инструмент для работы с MySQL
   - Выберите базу данных `cg47924_simin`
   - Выполните SQL запрос из файла `create-table.sql`

3. **Проверьте работу API**
   - Откройте в браузере: `https://tajstore.ru/simin/`
   - Вы должны увидеть JSON с товарами

## Использование API

### Получить все товары
\`\`\`
GET https://tajstore.ru/simin/
\`\`\`

### Получить товары по категории
\`\`\`
GET https://tajstore.ru/simin/?category=burgers
GET https://tajstore.ru/simin/?category=drinks
GET https://tajstore.ru/simin/?category=sides
\`\`\`

## Формат ответа

\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Big Mac Burger",
      "name_ru": "Биг Мак Бургер",
      "name_tj": "Биг Мак Бургер",
      "price": "45.00",
      "category": "burgers",
      "image": "/big-mac-burger.jpg"
    }
  ],
  "count": 1
}
\`\`\`

## Структура базы данных

Таблица `products` содержит:
- `id` - уникальный идентификатор
- `name` - название на английском
- `name_ru` - название на русском
- `name_tj` - название на таджикском
- `description` - описание на английском
- `description_ru` - описание на русском
- `description_tj` - описание на таджикском
- `price` - цена
- `category` - категория (burgers, drinks, sides, desserts)
- `image` - путь к изображению
- `available` - доступность товара
- `created_at` - дата создания
- `updated_at` - дата обновления
