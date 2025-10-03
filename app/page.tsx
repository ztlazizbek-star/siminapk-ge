"use client"

import "../styles/globals.css"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/app/contexts/UserContext"
import Header from "@/components/Header"
import Stories from "@/components/Stories"
import Categories from "@/components/Categories"
import MenuItems from "@/components/MenuItems"
import Cart from "@/components/Cart"
import ProfileModal from "@/components/ProfileModal"
import StoryModal from "@/components/StoryModal"
import ItemModal from "@/components/ItemModal"
import Notification from "@/components/Notification"
import { fetchProducts, filterProductsByCategory, type Product } from "@/lib/api"

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
    image: "/story-burger-preview.jpg",
    images: ["/story-burger-full.jpg", "/juicy-beef-burger-with-fries.jpg"],
  },
  {
    image: "/story-pizza-preview.jpg",
    images: ["/story-pizza-full.jpg", "/hot-pizza-with-melted-cheese.jpg"],
  },
  {
    image: "/story-salad-preview.jpg",
    images: ["/story-salad-full.jpg", "/fresh-vegetable-salad-bowl.jpg"],
  },
  {
    image: "/story-dessert-preview.jpg",
    images: ["/story-dessert-full.jpg", "/chocolate-cake-with-cream.jpg"],
  },
  {
    image: "/story-drink-preview.jpg",
    images: ["/story-drink-full.jpg", "/cold-refreshing-drink.jpg"],
  },
]

const mockCategories = [
  { slug: "all", name: "Всё", icon: "https://img.icons8.com/color/48/000000/menu--v1.png" },
  { slug: "kids", name: "Для детей", icon: "https://img.icons8.com/color/48/000000/duck.png" },
  {
    slug: "group",
    name: "На компанию",
    icon: "https://avatars.mds.yandex.net/i?id=f29ab152846000ab011a0b8d9c21749c5f996a3f-5229055-images-thumbs&n=13",
  },
  { slug: "new", name: "Новинки", icon: "https://img.icons8.com/color/48/000000/sparkling.png" },
  {
    slug: "hot",
    name: "Хиты",
    icon: "https://avatars.mds.yandex.net/i?id=4e2311b5083f396f4a0fdce60dd6c211972ac3f3-12644621-images-thumbs&n=13",
  },
]

const mockSubcategories = [
  { slug: "all", name: "Всё" },
  { slug: "burger", name: "Бургер" },
  { slug: "drink", name: "Напитки" },
  { slug: "combo", name: "Комбо" },
  { slug: "snack", name: "Баскет" },
  { slug: "pors", name: "Порцы" },
]

export default function Home() {
  const router = useRouter()
  const { user, isRegistered, isLoading, setUser } = useUser()
  const [cart, setCart] = useState<CartItem[]>([])
  const [activeCategory, setActiveCategory] = useState("all")
  const [activeSubcategory, setActiveSubcategory] = useState("all")
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showStoryModal, setShowStoryModal] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [selectedStoryImages, setSelectedStoryImages] = useState<string[]>([])
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [notification, setNotification] = useState<NotificationState>({ show: false, message: "", type: "" })
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isRegistered) {
      router.push("/register")
    }
  }, [isRegistered, isLoading, router])

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      const fetchedProducts = await fetchProducts("all")
      setProducts(fetchedProducts)
      setLoading(false)
    }

    loadProducts()
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

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

  const openStory = (images: string[]) => {
    setSelectedStoryImages(images)
    setShowStoryModal(true)
  }

  const openItemModal = (item: MenuItem) => {
    setSelectedItem(item)
    setShowItemModal(true)
  }

  const filteredItems = filterProductsByCategory(
    products,
    activeSubcategory !== "all" ? activeSubcategory : activeCategory,
  )

  const handleProfileClick = () => {
    setShowProfileModal(true)
  }

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <i className="fas fa-spinner fa-spin" style={{ fontSize: "3rem", color: "#ff6200" }}></i>
        <p style={{ color: "#666", fontSize: "1.1rem" }}>Загрузка...</p>
      </div>
    )
  }

  if (!isRegistered || !user) {
    return null
  }

  return (
    <div>
      <Header user={user} onProfileClick={handleProfileClick} />

      <div className="container">
        <Stories stories={mockStories} onStoryClick={openStory} />

        <Categories
          categories={mockCategories}
          subcategories={mockSubcategories}
          activeCategory={activeCategory}
          activeSubcategory={activeSubcategory}
          onCategoryChange={setActiveCategory}
          onSubcategoryChange={setActiveSubcategory}
        />

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: "2rem", color: "#ff6200" }}></i>
            <p style={{ marginTop: "16px" }}>Загрузка товаров...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            <p>Товары не найдены</p>
          </div>
        ) : (
          <MenuItems items={filteredItems} onItemClick={openItemModal} />
        )}
      </div>

      <Cart cart={cart} onCartClick={() => (window.location.href = "/cart")} />

      <ProfileModal
        show={showProfileModal}
        user={user}
        onClose={() => setShowProfileModal(false)}
        onSave={async (updatedUser) => {
          console.log("[v0] onSave called with data:", updatedUser)
          try {
            console.log("[v0] Sending POST request to /api/user/update")
            const response = await fetch("/api/user/update", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(updatedUser),
            })

            console.log("[v0] Response status:", response.status)
            console.log("[v0] Response ok:", response.ok)

            const data = await response.json()
            console.log("[v0] Response data:", data)

            if (data.success) {
              console.log("[v0] Update successful, updating local state")
              setUser(updatedUser)
              localStorage.setItem("user", JSON.stringify(updatedUser))
              setShowProfileModal(false)
              showNotification("Профиль успешно обновлен", "success")
            } else {
              console.log("[v0] Update failed:", data.message || "Unknown error")
              showNotification("Ошибка обновления профиля", "error")
            }
          } catch (error) {
            console.error("[v0] Error updating profile:", error)
            showNotification("Ошибка обновления профиля", "error")
          }
        }}
      />

      <StoryModal show={showStoryModal} images={selectedStoryImages} onClose={() => setShowStoryModal(false)} />

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
