export interface Product {
  id: number
  name: string
  description: string
  price: string
  image: string
  category: string
  top_category?: string
  subcategory?: string
  isFeatured?: boolean
  isForKids?: boolean
  isForGroup?: boolean
  isNew?: boolean
  isHit?: boolean
}

export const IMAGE_BASE_URL = "https://tajstore.ru/simin/file/"

export const getImageUrl = (imagePath: string): string => {
  // If image path already starts with http/https, return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath
  }
  // Remove leading slash if present
  const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath
  return `${IMAGE_BASE_URL}${cleanPath}`
}

export const productsData: Product[] = [
  {
    id: 1,
    name: "Биг Мак",
    description: "Два мясных котлета, специальный соус, салат, сыр, соленые огурчики, лук на булочке с кунжутом",
    price: "25.50 TJS",
    image: "big-mac-burger.jpg", // Updated to use filename only
    category: "burger",
    top_category: "fastfood",
    isFeatured: true,
    isHit: true,
  },
  {
    id: 2,
    name: "Кока-Кола",
    description: "Освежающий газированный напиток",
    price: "8.00 TJS",
    image: "refreshing-cola.png", // Updated to use filename only
    category: "drink",
    top_category: "beverages",
    isForKids: true,
  },
  {
    id: 3,
    name: "Картофель Фри",
    description: "Золотистый картофель фри с хрустящей корочкой",
    price: "12.00 TJS",
    image: "crispy-french-fries.png", // Updated to use filename only
    category: "snack",
    top_category: "fastfood",
    isForKids: true,
    isHit: true,
  },
  {
    id: 4,
    name: "Чизбургер",
    description: "Сочный мясной котлет с расплавленным сыром и свежими овощами",
    price: "18.00 TJS",
    image: "cheeseburger.jpg", // Updated to use filename only
    category: "burger",
    top_category: "fastfood",
    isNew: true,
  },
  {
    id: 5,
    name: "Куриные Наггетсы",
    description: "Хрустящие куриные кусочки в золотистой панировке",
    price: "15.00 TJS",
    image: "chicken-nuggets.jpg", // Updated to use filename only
    category: "snack",
    top_category: "fastfood",
    isForKids: true,
  },
  {
    id: 6,
    name: "Апельсиновый Сок",
    description: "Свежевыжатый апельсиновый сок",
    price: "10.00 TJS",
    image: "orange-juice.jpg", // Updated to use filename only
    category: "drink",
    top_category: "beverages",
    isForKids: true,
    isNew: true,
  },
  {
    id: 7,
    name: "Комбо Мега",
    description: "Биг Мак + Картофель Фри + Кока-Кола",
    price: "40.00 TJS",
    image: "mega-combo.jpg", // Updated to use filename only
    category: "combo",
    top_category: "fastfood",
    isFeatured: false,
    isForGroup: true,
    isHit: true,
  },
  {
    id: 8,
    name: "Рыбный Бургер",
    description: "Филе рыбы в хрустящей панировке с соусом тартар",
    price: "22.00 TJS",
    image: "fish-burger.jpg", // Updated to use filename only
    category: "burger",
    top_category: "fastfood",
    isNew: true,
  },
  {
    id: 9,
    name: "Молочный Коктейль",
    description: "Густой молочный коктейль с ванильным вкусом",
    price: "12.00 TJS",
    image: "milkshake.jpg", // Updated to use filename only
    category: "drink",
    top_category: "beverages",
    isForKids: true,
  },
  {
    id: 10,
    name: "Крылышки Баффало",
    description: "Острые куриные крылышки в соусе баффало",
    price: "20.00 TJS",
    image: "buffalo-wings.jpg", // Updated to use filename only
    category: "pors",
    top_category: "fastfood",
    isForGroup: true,
    isHit: true,
  },
]

export const getProductsByCategory = (category: string, subcategory?: string): Product[] => {
  let filteredProducts: Product[] = []

  // If subcategory is provided and not "all", filter by subcategory
  if (subcategory && subcategory !== "all") {
    filteredProducts = productsData.filter(
      (product) => product.subcategory === subcategory || product.category === subcategory,
    )
  }
  // Otherwise filter by top_category or category
  else if (category === "all") {
    filteredProducts = [...productsData]
  } else if (category === "kids") {
    filteredProducts = productsData.filter((product) => product.isForKids)
  } else if (category === "group") {
    filteredProducts = productsData.filter((product) => product.isForGroup)
  } else if (category === "new") {
    filteredProducts = productsData.filter((product) => product.isNew)
  } else if (category === "hot") {
    filteredProducts = productsData.filter((product) => product.isHit)
  } else {
    // Filter by top_category or category
    filteredProducts = productsData.filter(
      (product) => product.top_category === category || product.category === category,
    )
  }

  // Set first product as featured, reset others
  return filteredProducts.map((product, index) => ({
    ...product,
    isFeatured: index === 0,
  }))
}

// Функция для получения товара по ID
export const getProductById = (id: number): Product | undefined => {
  return productsData.find((product) => product.id === id)
}

// Функция для получения рекомендуемых товаров
export const getFeaturedProducts = (): Product[] => {
  return productsData.filter((product) => product.isFeatured)
}

export interface Category {
  id: string
  name: string
  icon: string
  count?: number
}

export const categoriesData: Category[] = [
  {
    id: "all",
    name: "Все",
    icon: "🍽️",
  },
  {
    id: "burger",
    name: "Бургеры",
    icon: "🍔",
  },
  {
    id: "drink",
    name: "Напитки",
    icon: "🥤",
  },
  {
    id: "snack",
    name: "Закуски",
    icon: "🍟",
  },
  {
    id: "combo",
    name: "Комбо",
    icon: "🍽️",
  },
  {
    id: "pors",
    name: "Порции",
    icon: "🍗",
  },
  {
    id: "kids",
    name: "Для детей",
    icon: "👦",
  },
  {
    id: "group",
    name: "Для группы",
    icon: "👥",
  },
  {
    id: "new",
    name: "Новинки",
    icon: "🌟",
  },
  {
    id: "hot",
    name: "Хиты",
    icon: "🔥",
  },
]

export const getCategoryById = (id: string): Category | undefined => {
  return categoriesData.find((category) => category.id === id)
}

export const getCategoriesWithCounts = (): Category[] => {
  return categoriesData.map((category) => ({
    ...category,
    count: category.id === "all" ? productsData.length : getProductsByCategory(category.id).length,
  }))
}
