"use client"

import { formatPrice } from "@/lib/utils"

interface MenuItem {
  id: number
  name: string
  description: string
  price: string
  image: string
}

interface ItemModalProps {
  show: boolean
  item: MenuItem | null
  onClose: () => void
  onAddToCart: (item: MenuItem) => void
}

export default function ItemModal({ show, item, onClose, onAddToCart }: ItemModalProps) {
  if (!show || !item) {
    return null
  }

  const handleAddToCart = () => {
    onAddToCart(item)
    onClose()
  }

  return (
    <div id="itemModal" className="item-modal-new modal-gradient-bg">
      <div className="item-modal-content-new">
        <button className="item-modal-close-new fixed top-2 right-2 z-50" onClick={onClose}>
          ×
        </button>

        <div className="item-modal-image-new">
          <img src={item.image || "/placeholder.svg"} alt={item.name} />
        </div>

        <h2 className="item-modal-title-new">{item.name}</h2>

        <button className="item-modal-size-btn text-sidebar-accent-foreground">{item.description}</button>

        <button className="item-modal-add-new tracking-normal" onClick={handleAddToCart}>
          +{formatPrice(item.price)}
        </button>
      </div>
    </div>
  )
}
