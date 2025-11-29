"use client"

import { useState } from "react"
import { useUser } from "@/app/contexts/UserContext"

interface CartItem {
  id: number
  name: string
  description?: string
  price: string
  image: string
  quantity: number
}

interface CheckoutModalProps {
  cart: CartItem[]
  totalPrice: number
  isPromoApplied: boolean
  orderType: "delivery" | "pickup"
  paymentType: "card" | "cash"
  onOrderTypeChange: (type: "delivery" | "pickup") => void
  onPaymentTypeChange: (type: "card" | "cash") => void
  onClose: () => void
  onSuccess: () => void
}

export default function CheckoutModal({
  cart,
  totalPrice,
  isPromoApplied,
  orderType,
  paymentType,
  onOrderTypeChange,
  onPaymentTypeChange,
  onClose,
  onSuccess,
}: CheckoutModalProps) {
  const { user } = useUser()
  const [name, setName] = useState(user?.name || "")
  const [address, setAddress] = useState(user?.address || "")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Пожалуйста, введите ваше имя")
      return
    }

    if (orderType === "delivery" && !address.trim()) {
      alert("Пожалуйста, введите адрес доставки")
      return
    }

    setIsLoading(true)

    try {
      // Send order to Telegram
      const orderDetails = {
        customerName: name,
        phone: user?.phone || "",
        address: orderType === "delivery" ? address : "Самовывоз",
        orderType: orderType === "delivery" ? "Доставка" : "Самовывоз",
        paymentType: paymentType === "card" ? "Карта" : "Наличные",
        items: cart.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalPrice: totalPrice.toFixed(2),
        isPromoApplied,
      }

      const response = await fetch("/api/telegram/send-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderDetails),
      })

      if (response.ok) {
        // Send SMS notification
        await fetch("/api/sms/order-success", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: user?.phone || "",
            totalPrice: totalPrice.toFixed(2),
            orderType: orderType === "delivery" ? "Доставка" : "Самовывоз",
          }),
        })

        onSuccess()
      } else {
        alert("Ошибка при оформлении заказа")
      }
    } catch (error) {
      console.error("Error submitting order:", error)
      alert("Ошибка при оформлении заказа")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <h2 className="modal-title">Оформление заказа</h2>

        <div className="form-group">
          <label>Имя</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Введите ваше имя"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label>Тип заказа</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="orderType"
                checked={orderType === "delivery"}
                onChange={() => onOrderTypeChange("delivery")}
                disabled={isLoading}
              />
              <span>Доставка</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="orderType"
                checked={orderType === "pickup"}
                onChange={() => onOrderTypeChange("pickup")}
                disabled={isLoading}
              />
              <span>Самовывоз</span>
            </label>
          </div>
        </div>

        {orderType === "delivery" && (
          <div className="form-group">
            <label>Адрес доставки</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Введите адрес доставки"
              disabled={isLoading}
            />
          </div>
        )}

        <div className="form-group">
          <label>Способ оплаты</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="paymentType"
                checked={paymentType === "cash"}
                onChange={() => onPaymentTypeChange("cash")}
                disabled={isLoading}
              />
              <span>Наличные</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="paymentType"
                checked={paymentType === "card"}
                onChange={() => onPaymentTypeChange("card")}
                disabled={isLoading}
              />
              <span>Карта</span>
            </label>
          </div>
        </div>

        <div className="order-summary">
          <div className="summary-row">
            <span>Товары ({cart.length})</span>
            <span>{totalPrice.toFixed(2)} TJS</span>
          </div>
          {isPromoApplied && (
            <div className="summary-row promo">
              <span>Скидка (10%)</span>
              <span>-{(totalPrice * 0.1).toFixed(2)} TJS</span>
            </div>
          )}
          <div className="summary-row total">
            <span>Итого</span>
            <span>{totalPrice.toFixed(2)} TJS</span>
          </div>
        </div>

        <button className="submit-btn" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Оформление..." : `Оформить заказ на ${totalPrice.toFixed(2)} TJS`}
        </button>
      </div>
    </div>
  )
}
