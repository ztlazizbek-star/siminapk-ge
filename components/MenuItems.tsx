"use client"
import { formatPrice } from "@/lib/utils"
import { getImageUrl } from "@/data/products" // Import helper function

interface MenuItem {
  id: number
  name: string
  description: string
  price: string
  image: string
  category: string
  isFeatured?: boolean
}

interface MenuItemsProps {
  items: MenuItem[]
  onItemClick: (item: MenuItem) => void
}

export default function MenuItems({ items, onItemClick }: MenuItemsProps) {
  return (
    <div className="menu-items" id="menuItems">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`${item.isFeatured ? "featured-item" : "menu-item"} ${index === 0 ? "first-item" : ""}`}
          onClick={() => onItemClick(item)}
        >
          {item.isFeatured ? (
            <>
              <div className="featured-item-image-container">
                <img
                  src={getImageUrl(item.image) || "/placeholder.svg"}
                  alt={item.name}
                  className="featured-item-image"
                  loading="lazy"
                />
              </div>
              <div className="featured-item-content">
                <h3>{item.name}</h3>
                <p className="featured-item-description">{item.description}</p>
                <p className="featured-item-price">{formatPrice(item.price)}</p>
              </div>
            </>
          ) : (
            <>
              <div className="photo-item-image-container">
                <img
                  src={getImageUrl(item.image) || "/placeholder.svg"}
                  alt={item.name}
                  className="photo-item-image"
                  loading="lazy"
                />
              </div>
              <div className="menu-item-content">
                <h3>{item.name}</h3>
                <p className="menu-item-description">{item.description}</p>
                <p className="menu-item-price">{formatPrice(item.price)}</p>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
