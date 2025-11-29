"use client"

import type React from "react"
import type { ReactElement } from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/app/contexts/UserContext" // Import useUser hook
import "./cart.css"

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

export default function CartPage(): ReactElement {
  const router = useRouter()
  const { user } = useUser() // Use useUser hook to get user data
  const [cart, setCart] = useState<CartItem[]>([])
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [isPromoApplied, setIsPromoApplied] = useState(false)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [showPromoModal, setShowPromoModal] = useState(false)
  const [showClearModal, setShowClearModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false) // New state for loading indicator
  const [orderType, setOrderType] = useState("")
  const [paymentType, setPaymentType] = useState("")

  const PROMO_CODE = "скидка10"
  const discount = isPromoApplied ? 0.1 : 0

  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }

    const savedPromo = localStorage.getItem("promoApplied")
    if (savedPromo) {
      setIsPromoApplied(JSON.parse(savedPromo))
    }

    loadSuggestions()
  }, [])

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  const getNumericPrice = (priceString: string): number => {
    if (typeof priceString === "number") return priceString
    if (!priceString || typeof priceString !== "string") return 0
    const cleanedPrice = priceString.replace("от ", "").replace(" TJS.", "").replace(" TJS", "")
    const result = Number.parseFloat(cleanedPrice)
    return isNaN(result) ? 0 : result
  }

  const loadSuggestions = () => {
    // Fallback suggestions
    const fallbackSuggestions: SuggestionItem[] = [
      {
        id: 3,
        name: "шашлык",
        price: 56,
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
    const newCart = [...cart]
    const item = newCart[index]
    const newQuantity = Math.max(0, item.quantity + change)

    if (newQuantity === 0) {
      newCart.splice(index, 1)
      showNotification(`${item.name} удален из корзины`)
    } else {
      newCart[index].quantity = newQuantity
      showNotification(`Количество изменено: ${item.name} (${newQuantity} шт.)`)
    }

    setCart(newCart)
  }

  const addToCart = (suggestionId: number) => {
    const suggestion = suggestions.find((item) => item.id === suggestionId)
    if (!suggestion) return

    const priceString = `${suggestion.price.toFixed(2)} TJS`
    const existingIndex = cart.findIndex((item) => item.name === suggestion.name && item.price === priceString)

    if (existingIndex !== -1) {
      const newCart = [...cart]
      newCart[existingIndex].quantity += 1
      setCart(newCart)
      showNotification(`Количество увеличено: ${suggestion.name} (${newCart[existingIndex].quantity} шт.)`)
    } else {
      setCart([
        ...cart,
        {
          id: suggestion.id,
          name: suggestion.name,
          price: priceString,
          image: suggestion.image,
          quantity: 1,
          description: suggestion.description,
        },
      ])
      showNotification(`${suggestion.name} добавлен в корзину`)
    }
  }

  const clearCart = () => {
    setCart([])
    setShowClearModal(false)
    showNotification("Корзина очищена")
  }

  const applyPromoCode = (code: string) => {
    if (code.toLowerCase() === PROMO_CODE) {
      if (isPromoApplied) {
        showNotification("Промокод уже использован", "error")
      } else {
        setIsPromoApplied(true)
        localStorage.setItem("promoApplied", JSON.stringify(true))
        showNotification("Промокод применен! Скидка 10%")
      }
    } else {
      showNotification("Неверный промокод", "error")
    }
    setShowPromoModal(false)
  }

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    const notification = document.createElement("div")
    notification.className = `notification ${type}`

    const icon = document.createElement("div")
    icon.className = "notification-icon"
    icon.innerHTML =
      type === "success"
        ? '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M16.667 5L7.5 14.167 3.333 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 6v4m0 4h.01M10 18a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>'

    const text = document.createElement("span")
    text.className = "notification-text"
    text.textContent = message

    notification.appendChild(icon)
    notification.appendChild(text)
    document.body.appendChild(notification)

    setTimeout(() => notification.classList.add("show"), 10)
    setTimeout(() => {
      notification.classList.remove("show")
      setTimeout(() => notification.remove(), 300)
    }, 2700)
  }

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => {
      const price = getNumericPrice(item.price)
      return sum + price * item.quantity
    }, 0)
    const deliveryFee = orderType === "delivery" ? 10 : 0
    return subtotal * (1 - discount) + deliveryFee
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = calculateTotal()
  const itemText = totalItems === 1 ? "товар" : totalItems >= 2 && totalItems <= 4 ? "товара" : "товаров"

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const phone = formData.get("phone") as string
    const deliveryAddress = formData.get("deliveryAddress") as string
    const pickupAddress = formData.get("pickupAddress") as string
    const comment = formData.get("comment") as string

    if (!name || !phone || !orderType || !paymentType) {
      showNotification("Пожалуйста, заполните все обязательные поля", "error")
      return
    }

    if (!/^\d{9}$/.test(phone)) {
      showNotification("Номер телефона должен содержать ровно 9 цифр", "error")
      return
    }

    if (orderType === "delivery" && !deliveryAddress) {
      showNotification("Пожалуйста, введите адрес доставки", "error")
      return
    }

    const TELEGRAM_BOT_TOKEN = "8267879429:AAE-P7BuRbwK3kWy1-XD-_WR_i8yjqTOdZQ"
    const TELEGRAM_CHAT_ID = "7436669286"

    const message = `
*Новый заказ*
Имя: ${name}
Телефон: +992${phone}
Тип заказа: ${orderType === "delivery" ? "Доставка" : "Собой"}
Адрес: ${orderType === "delivery" ? deliveryAddress : pickupAddress}
Тип оплаты: ${paymentType === "card" ? "Карта онлайн" : "Наличные"}
Комментарий: ${comment || "Нет"}
*Товары:*
${cart.map((item) => `- ${item.name} (${item.quantity} шт): ${(getNumericPrice(item.price) * item.quantity).toFixed(2)} TJS`).join("\n")}
${isPromoApplied ? "Скидка: 10%" : ""}
${orderType === "delivery" ? "Стоимость доставки: 10.00 TJS" : ""}
*Общая сумма: ${totalPrice.toFixed(2)} TJS*
    `

    setIsSubmitting(true)

    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "Markdown",
        }),
      })

      const result = await response.json()
      if (result.ok) {
        try {
          await fetch("/api/sms/order-success", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone: `992${phone}`,
              orderDetails: {
                totalPrice: totalPrice.toFixed(2),
                orderType: orderType === "delivery" ? "Доставка" : "Собой",
              },
            }),
          })
        } catch (smsError) {
          console.error("Error sending SMS notification:", smsError)
          // Продолжаем даже если SMS не отправилась
        }

        setShowCheckoutModal(false)
        setShowSuccessModal(true)
      } else {
        setIsSubmitting(false)
        showNotification("Ошибка при отправке заказа", "error")
      }
    } catch (error) {
      console.error("Error sending to Telegram:", error)
      setIsSubmitting(false)
      showNotification("Ошибка при отправке заказа", "error")
    }
  }

  const onClose = () => {
    setShowCheckoutModal(false)
    setShowSuccessModal(false)
    router.push("/")
  }

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
                  <span className="item-price">{(getNumericPrice(item.price) * item.quantity).toFixed(2)} TJS</span>
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
        <div id="checkout-modal" onClick={(e) => e.target === e.currentTarget && setShowCheckoutModal(false)}>
          <div className="modal-content">
            {isSubmitting && (
              <div className="loading-overlay">
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>Оформление заказа...</p>
                </div>
              </div>
            )}
            <h2>Оформление заказа</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <svg
                  className="input-icon"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input
                  type="text"
                  name="name"
                  placeholder="Введите ваше имя"
                  defaultValue={user?.name || ""}
                  required
                />
              </div>
              <div className="input-group phone-group">
                <img src="/images/design-mode/tj.png" alt="Tajikistan Flag" className="phone-flag" />
                <span className="phone-code">+992</span>
                <input type="tel" name="phone" placeholder="123456789" pattern="[0-9]{9}" maxLength={9} required />
              </div>
              <div className="input-group">
                <svg
                  className="input-icon"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <select name="orderType" value={orderType} onChange={(e) => setOrderType(e.target.value)} required>
                  <option value="" disabled>
                    Выберите тип заказа
                  </option>
                  <option value="delivery">Доставка</option>
                  <option value="pickup">Собой</option>
                </select>
              </div>
              {orderType === "delivery" && (
                <div className="input-group">
                  <svg
                    className="input-icon"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <input type="text" name="deliveryAddress" placeholder="Введите адрес доставки" required />
                </div>
              )}
              {orderType === "pickup" && (
                <div className="input-group">
                  <svg
                    className="input-icon"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  <select name="pickupAddress">
                    <option value="">Выберите адрес самовывоза</option>
                    <option value="Хиёбони рудаки 151">Хиёбони рудаки 151 (загс)</option>
                    <option value="г.Пенджикент против магазин Сумая Кафе Симин">
                      против магазин Сумая Кафе Симин
                    </option>
                  </select>
                </div>
              )}
              <div className="input-group">
                <svg
                  className="input-icon"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="M2 10h20"></path>
                </svg>
                <select
                  name="paymentType"
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Выберите тип оплаты
                  </option>
                  <option value="card">Карта онлайн</option>
                  <option value="cash">Наличные</option>
                </select>
              </div>
              <div className="input-group">
                <svg
                  className="input-icon"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <textarea name="comment" placeholder="Ваш комментарий (необязательно)"></textarea>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={onClose} disabled={isSubmitting}>
                  Отмена
                </button>
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? "Отправка..." : "Отправить заказ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal-content">
            <div className="success-icon-container">
              <svg className="success-icon" viewBox="0 0 52 52">
                <circle className="success-icon-circle" cx="26" cy="26" r="25" fill="none" />
                <path className="success-icon-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
            <h2 className="success-title">Заказ успешно оформлен!</h2>
            <p className="success-message">Ожидайте звонка от нашего оператора для подтверждения заказа</p>
            <button className="success-btn" onClick={onClose}>
              Вернуться в меню
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
