"use client"

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
    <div id="itemModal" className="item-modal-new">
      <div className="item-modal-content-new">
        <button className="item-modal-close-new" onClick={onClose}>
          ×
        </button>

        <div className="item-modal-image-new">
          <img src={item.image || "/placeholder.svg"} alt={item.name} />
        </div>

        <h2 className="item-modal-title-new">{item.name}</h2>

        <button className="item-modal-size-btn">{item.name} 1кг</button>

        <div className="item-modal-price-new">{item.price}</div>

        <button className="item-modal-add-new tracking-normal" onClick={handleAddToCart}>
          +{item.price}
        </button>
      </div>
    </div>
  )
}
