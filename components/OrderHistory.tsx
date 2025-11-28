"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

interface Order {
  id: number
  user_name: string
  order_type: string
  delivery_address: string
  payment_type: string
  items: any[]
  total_price: number
  status: string
  created_at: string
}

interface OrderHistoryProps {
  phone: string
  isOpen: boolean
  onClose: () => void
}

export default function OrderHistory({ phone, isOpen, onClose }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen && phone) {
      fetchOrders()
    }
  }, [isOpen, phone])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders?phone=${phone}`)
      const data = await response.json()

      if (data.success) {
        setOrders(data.orders)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: "В обработке",
      confirmed: "Подтверждён",
      delivering: "Доставляется",
      completed: "Завершён",
      cancelled: "Отменён",
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      pending: "status-pending",
      confirmed: "status-confirmed",
      delivering: "status-delivering",
      completed: "status-completed",
      cancelled: "status-cancelled",
    }
    return colorMap[status] || ""
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!isOpen) return null

  return (
    <div className="order-history-overlay" onClick={onClose}>
      <div className="order-history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="order-history-header">
          <h2>История заказов</h2>
          <button onClick={onClose} className="close-button" aria-label="Закрыть">
            <X size={24} />
          </button>
        </div>

        <div className="order-history-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Загрузка истории...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <p>У вас пока нет заказов</p>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-id">Заказ #{order.id}</div>
                    <div className={`order-status ${getStatusColor(order.status)}`}>{getStatusText(order.status)}</div>
                  </div>

                  <div className="order-date">{formatDate(order.created_at)}</div>

                  <div className="order-details">
                    <div className="detail-row">
                      <span className="detail-label">Тип:</span>
                      <span className="detail-value">{order.order_type}</span>
                    </div>
                    {order.delivery_address && (
                      <div className="detail-row">
                        <span className="detail-label">Адрес:</span>
                        <span className="detail-value">{order.delivery_address}</span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="detail-label">Оплата:</span>
                      <span className="detail-value">{order.payment_type}</span>
                    </div>
                  </div>

                  <div className="order-items">
                    {JSON.parse(order.items as any).map((item: any, index: number) => (
                      <div key={index} className="order-item">
                        <span className="item-name">
                          {item.name} x{item.quantity}
                        </span>
                        <span className="item-price">{item.price} TJS</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-total">
                    <span className="total-label">Итого:</span>
                    <span className="total-price">{order.total_price} TJS</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
