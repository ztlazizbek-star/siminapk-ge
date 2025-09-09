"use client"

import { useState, useEffect } from "react"
import Header from "@/components/Header"
import Stories from "@/components/Stories"
import Categories from "@/components/Categories"
import MenuItems from "@/components/MenuItems"
import Cart from "@/components/Cart"
import ProfileModal from "@/components/ProfileModal"
import StoryModal from "@/components/StoryModal"
import ItemModal from "@/components/ItemModal"
import Notification from "@/components/Notification"

interface User {
  name: string
  phone: string
  address: string
  profilePhoto: string | null
}

interface MenuItem {
  id: number
  name: string
  description: string
  price: string
  image: string
  category: string
  isFeatured?: boolean
}

interface CartItem extends MenuItem {
  quantity: number
}

interface NotificationState {
  show: boolean
  message: string
  type: string
}

// Mock data
const mockUser: User = {
  name: "Иван Петров",
  phone: "123456789",
  address: "ул. Ленина, 123, кв. 45",
  profilePhoto: null,
}

const mockStories = [
  {
    image: "https://axe-tech.ru/images/cms/data/164187825561dd12ef13669.jpg",
    fullImage: "https://example.com/story1_full.jpg",
  },
  {
    image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/91/68/7c/caption.jpg?w=800&h=500&s=1",
    fullImage: "https://example.com/story2_full.jpg",
  },
  {
    image: "https://steamuserimages-a.akamaihd.net/ugc/2053113256292034683/69B12E63AB5082327061A20DA737941BED8C5892/",
    fullImage: "https://example.com/story3_full.jpg",
  },
  {
    image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/91/68/7c/caption.jpg?w=800&h=500&s=1",
    fullImage: "https://example.com/story4_full.jpg",
  },
  {
    image: "https://avatars.mds.yandex.net/i?id=eac24a40ca9c5823dd83356b78a38b8bcf8b0ebf-3796663-images-thumbs&n=13",
    fullImage: "https://example.com/story5_full.jpg",
  },
]

const mockMenuItems: MenuItem[] = [
  {
    id: 1,
    name: "Биг Мак",
    description: "Классический бургер с двумя котлетами",
    price: "25.00 TJS",
    image: "/big-mac-burger.jpg",
    category: "burgers",
    isFeatured: true,
  },
  {
    id: 2,
    name: "Чизбургер",
    description: "Сочный бургер с сыром",
    price: "20.00 TJS",
    image: "/classic-cheeseburger.png",
    category: "burgers",
    isFeatured: false,
  },
  {
    id: 3,
    name: "Картофель фри",
    description: "Хрустящий картофель фри",
    price: "12.00 TJS",
    image: "/crispy-french-fries.png",
    category: "sides",
    isFeatured: true,
  },
  {
    id: 4,
    name: "Кока-Кола",
    description: "Освежающий напиток",
    price: "8.00 TJS",
    image: "/refreshing-cola.png",
    category: "drinks",
    isFeatured: false,
  },
]

const mockCategories = [
  { id: 1, name: "Бургеры", slug: "burgers", icon: "🍔" },
  { id: 2, name: "Гарниры", slug: "sides", icon: "🍟" },
  { id: 3, name: "Напитки", slug: "drinks", icon: "🥤" },
  { id: 4, name: "Десерты", slug: "desserts", icon: "🍰" },
]

const mockSubcategories = [
  { id: 1, name: "Классические", slug: "classic", parent: "burgers" },
  { id: 2, name: "Острые", slug: "spicy", parent: "burgers" },
  { id: 3, name: "Холодные", slug: "cold", parent: "drinks" },
  { id: 4, name: "Горячие", slug: "hot", parent: "drinks" },
]

export default function Home() {
  const [user, setUser] = useState<User>(mockUser)
  const [cart, setCart] = useState<CartItem[]>([])
  const [activeCategory, setActiveCategory] = useState("all")
  const [activeSubcategory, setActiveSubcategory] = useState("all")
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showStoryModal, setShowStoryModal] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [selectedStory, setSelectedStory] = useState("")
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [notification, setNotification] = useState<NotificationState>({ show: false, message: "", type: "" })
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // Try to load from API first
        try {
          const productsResponse = await fetch("/api/products.php")

          // Check if response is successful and JSON
          if (productsResponse.ok && productsResponse.headers.get("content-type")?.includes("application/json")) {
            const productsData = await productsResponse.json()
            setMenuItems(
              productsData.map((item: any) => ({
                ...item,
                isFeatured: item.is_featured === 1,
              })),
            )
          } else {
            throw new Error("API not available or returned non-JSON response")
          }
        } catch (error) {
          console.log("Products API not available, using mock data")
          setMenuItems(mockMenuItems)
        }

        // Load categories with proper error handling
        try {
          const categoriesResponse = await fetch("/api/categories.php?type=main")
          if (categoriesResponse.ok && categoriesResponse.headers.get("content-type")?.includes("application/json")) {
            const categoriesData = await categoriesResponse.json()
            setCategories(categoriesData)
          } else {
            throw new Error("Categories API not available")
          }
        } catch (error) {
          console.log("Categories API not available, using mock data")
          setCategories(mockCategories)
        }

        // Load subcategories with proper error handling
        try {
          const subcategoriesResponse = await fetch("/api/categories.php?type=sub")
          if (
            subcategoriesResponse.ok &&
            subcategoriesResponse.headers.get("content-type")?.includes("application/json")
          ) {
            const subcategoriesData = await subcategoriesResponse.json()
            setSubcategories(subcategoriesData)
          } else {
            throw new Error("Subcategories API not available")
          }
        } catch (error) {
          console.log("Subcategories API not available, using mock data")
          setSubcategories(mockSubcategories)
        }
      } catch (generalError) {
        console.log("General error loading data, using all mock data")
        setMenuItems(mockMenuItems)
        setCategories(mockCategories)
        setSubcategories(mockSubcategories)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" })
    }, 3000)
  }

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id)
    if (existingItem) {
      setCart(
        cart.map((cartItem) => (cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem)),
      )
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
    showNotification("Товар добавлен в корзину", "success")
  }

  const openStory = (fullImage: string) => {
    setSelectedStory(fullImage)
    setShowStoryModal(true)
  }

  const openItemModal = (item: MenuItem) => {
    setSelectedItem(item)
    setShowItemModal(true)
  }

  const filteredItems = menuItems.filter((item) => {
    if (activeCategory !== "all" && item.category !== activeCategory) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header user={user} onProfileClick={() => setShowProfileModal(true)} />

      <div className="container">
        <Stories stories={mockStories} onStoryClick={openStory} />

        <Categories
          categories={categories}
          subcategories={subcategories}
          activeCategory={activeCategory}
          activeSubcategory={activeSubcategory}
          onCategoryChange={setActiveCategory}
          onSubcategoryChange={setActiveSubcategory}
        />

        <MenuItems items={filteredItems} onItemClick={openItemModal} />
      </div>

      <Cart cart={cart} onCartClick={() => (window.location.href = "/cart")} />

      <ProfileModal
        show={showProfileModal}
        user={user}
        onClose={() => setShowProfileModal(false)}
        onSave={(updatedUser) => {
          setUser(updatedUser)
          setShowProfileModal(false)
          showNotification("Профиль успешно обновлен", "success")
        }}
      />

      <StoryModal show={showStoryModal} image={selectedStory} onClose={() => setShowStoryModal(false)} />

      <ItemModal
        show={showItemModal}
        item={selectedItem}
        onClose={() => setShowItemModal(false)}
        onAddToCart={addToCart}
      />

      <Notification show={notification.show} message={notification.message} type={notification.type} />
    </div>
  )
}
