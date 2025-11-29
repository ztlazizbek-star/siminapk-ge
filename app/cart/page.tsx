"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/app/contexts/UserContext"
import { useCart } from "@/app/contexts/CartContext" // Import useCart hook
import "./cart.css"
import CheckoutModal from "@/components/CheckoutModal"
import SuccessModal from "@/components/SuccessModal"

const IMAGE_BASE_URL = "https://tajstore.ru/simin/file/"

const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return "/placeholder.svg"
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath
  }
  return `${IMAGE_BASE_URL}${imagePath}`
}

interface CartItem {
  id: number
  name: string
  description?: string
  price: string
  image: string
  quantity: number
}

interface SuggestionItem {
  id: number
  name: string
  price: number
  image: string
  description: string
}

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity: updateQuantityHook, clearCart, getTotal } = useCart()
  const router = useRouter()
  const { user } = useUser()
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery")
  const [paymentType, setPaymentType] = useState<"card" | "cash">("cash")
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [isPromoApplied, setIsPromoApplied] = useState(false)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [showPromoModal, setShowPromoModal] = useState(false)
  const [showClearModal, setShowClearModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const PROMO_CODE = "скидка10"
  const discount = isPromoApplied ? 0.1 : 0

  useEffect(() => {
    const savedPromo = localStorage.getItem("promoApplied")
    if (savedPromo) {
      setIsPromoApplied(JSON.parse(savedPromo))
    }

    loadSuggestions()
  }, [])

  const loadSuggestions = () => {
    // Fallback suggestions
    const fallbackSuggestions: SuggestionItem[] = [
      {
        id: 3,
        name: "Додстер",
        price: 26,
        image: "https://media.dodostatic.net/image/r:292x292/11eed74f9e684d30b1ac51e4eb470c07.avif",
        description: "1 шт",
      },
      {
        id: 4,
        name: "Fusetea",
        price: 8,
        image: "https://media.dodostatic.net/image/r:292x292/019575981edd756a8e34a1d8982d5951.avif",
        description: "0.5 л",
      },
      {
        id: 5,
        name: "Куриные кусочки",
        price: 50,
        image: "https://media.dodostatic.net/image/r:292x292/0196d3af284b78bea22d091a75e40389.avif",
        description: "280 г",
      },
    ]
    setSuggestions(fallbackSuggestions)
  }

  const updateQuantity = (index: number, change: number) => {
    const item = cart[index]
    const newQuantity = Math.max(0, item.quantity + change)

    if (newQuantity === 0) {
      removeFromCart(item.id)
      setNotification({ message: `${item.name} удален из корзины`, type: "success" })
    } else {
      updateQuantityHook(item.id, newQuantity)
      setNotification({ message: `Количество изменено: ${item.name} (${newQuantity} шт.)`, type: "success" })
    }
  }

  const addToCart = (suggestionId: number) => {
    const suggestion = suggestions.find((item) => item.id === suggestionId)
    if (!suggestion) return

    const priceString = `${suggestion.price.toFixed(2)} TJS`
    const existingItem = cart.find((item) => item.name === suggestion.name && item.price === priceString)

    if (existingItem) {
      updateQuantityHook(existingItem.id, existingItem.quantity + 1)
      setNotification({
        message: `Количество увеличено: ${suggestion.name} (${existingItem.quantity + 1} шт.)`,
        type: "success",
      })
    } else {
      const newItem: CartItem = {
        id: suggestion.id,
        name: suggestion.name,
        price: priceString,
        image: suggestion.image,
        quantity: 1,
        description: suggestion.description,
      }
      updateQuantityHook(newItem.id, newItem.quantity)
      setNotification({ message: `${suggestion.name} добавлен в корзину`, type: "success" })
    }
  }

  const applyPromoCode = (code: string) => {
    if (code.toLowerCase() === PROMO_CODE) {
      if (isPromoApplied) {
        setNotification({ message: "Промокод уже использован", type: "error" })
      } else {
        setIsPromoApplied(true)
        localStorage.setItem("promoApplied", JSON.stringify(true))
        setNotification({ message: "Промокод применен! Скидка 10%", type: "success" })
      }
    } else {
      setNotification({ message: "Неверный промокод", type: "error" })
    }
    setShowPromoModal(false)
  }

  const calculateTotal = () => {
    return getTotal() * (1 - discount)
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = calculateTotal()
  const itemText = totalItems === 1 ? "товар" : totalItems >= 2 && totalItems <= 4 ? "товара" : "товаров"

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1 className="title">Корзина</h1>
        <button className="trash-btn" onClick={() => setShowClearModal(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </header>

      {/* Cart Summary */}
      <div className="cart-summary">
        <span>
          {totalItems} {itemText} на {totalPrice.toFixed(2)} TJS
        </span>
      </div>

      {/* Cart Items */}
      <div className="cart-items">
        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            <p>Корзина пуста</p>
            <p>Добавьте товары из меню</p>
          </div>
        ) : (
          cart.map((item, index) => (
            <div key={index} className="cart-item">
              <div className="item-image">
                <img src={getImageUrl(item.image) || "/placeholder.svg"} alt={item.name} className="food-image" />
              </div>
              <div className="item-details">
                <h3 className="item-name">{item.name}</h3>
                <p className="item-description">{item.quantity} шт</p>
                <div className="item-footer">
                  <span className="item-price">
                    {(Number.parseFloat(item.price.replace(" TJS", "")) * item.quantity).toFixed(2)} TJS
                  </span>
                </div>
              </div>
              <div className="quantity-controls">
                <button className="qty-btn minus" onClick={() => updateQuantity(index, -1)}>
                  −
                </button>
                <span className="quantity">{item.quantity}</span>
                <button className="qty-btn plus" onClick={() => updateQuantity(index, 1)}>
                  +
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add to Order Section */}
      <div className="add-to-order">
        <h2 className="section-title">Добавить к заказу?</h2>
        <div className="suggestions">
          {suggestions.map((item) => (
            <div key={item.id} className="suggestion-item" onClick={() => addToCart(item.id)}>
              <img src={getImageUrl(item.image) || "/placeholder.svg"} alt={item.name} className="suggestion-image" />
              <h4 className="suggestion-name">{item.name}</h4>
              <p className="suggestion-description">{item.description}</p>
              <span className="suggestion-price">{item.price.toFixed(2)} TJS</span>
            </div>
          ))}
        </div>
      </div>

      {/* Promo Code */}
      <button className="promo-btn" onClick={() => setShowPromoModal(true)}>
        Ввести промокод
      </button>

      {/* Checkout Button */}
      <button
        className="checkout-btn"
        disabled={cart.length === 0}
        style={{ opacity: cart.length === 0 ? 0.5 : 1, cursor: cart.length === 0 ? "not-allowed" : "pointer" }}
        onClick={() => setShowCheckoutModal(true)}
      >
        ОФОРМИТЬ ЗА {totalPrice.toFixed(2)} TJS
      </button>

      {/* Promo Modal */}
      {showPromoModal && (
        <div id="custom-alert">
          <div className="alert-box">
            <h3>Ввести промокод</h3>
            <div className="input-group">
              <input type="text" id="promo-code-input" placeholder="Введите промокод" />
            </div>
            <div className="alert-actions">
              <button onClick={() => setShowPromoModal(false)}>Отмена</button>
              <button
                onClick={() => {
                  const input = document.getElementById("promo-code-input") as HTMLInputElement
                  applyPromoCode(input.value)
                }}
              >
                Применить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Cart Modal */}
      {showClearModal && (
        <div id="custom-alert">
          <div className="alert-box">
            <h3>Очистить корзину?</h3>
            <p>Вы хотите очистить корзину?</p>
            <div className="alert-actions">
              <button onClick={() => setShowClearModal(false)}>Нет</button>
              <button onClick={clearCart}>Да</button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <CheckoutModal
          cart={cart}
          totalPrice={totalPrice}
          isPromoApplied={isPromoApplied}
          orderType={orderType}
          paymentType={paymentType}
          onOrderTypeChange={setOrderType}
          onPaymentTypeChange={setPaymentType}
          onClose={() => setShowCheckoutModal(false)}
          onSuccess={() => {
            clearCart()
            setIsPromoApplied(false)
            localStorage.setItem("promoApplied", JSON.stringify(false))
            setShowCheckoutModal(false)
            setShowSuccessModal(true)
          }}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          onClose={() => {
            setShowSuccessModal(false)
            router.push("/")
          }}
        />
      )}

      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-icon">
            {notification.type === "success" ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M16.667 5L7.5 14.167 3.333 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 6v4m0 4h.01M10 18a8 8 0 100-16 8 8 0 000 16z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <span className="notification-text">{notification.message}</span>
        </div>
      )}
    </div>
  )
}
