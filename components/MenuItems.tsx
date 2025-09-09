"use client"

import { useState, useEffect } from "react"

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
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
  const [loadingImages, setLoadingImages] = useState<Set<number>>(new Set())

  useEffect(() => {
    const loadImagesSequentially = async () => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]

        // Add delay between each image load
        await new Promise((resolve) => setTimeout(resolve, i * 200))

        setLoadingImages((prev) => new Set([...prev, item.id]))

        const img = new Image()
        img.onload = () => {
          setLoadedImages((prev) => new Set([...prev, item.id]))
          setLoadingImages((prev) => {
            const newSet = new Set(prev)
            newSet.delete(item.id)
            return newSet
          })
        }
        img.onerror = () => {
          setLoadingImages((prev) => {
            const newSet = new Set(prev)
            newSet.delete(item.id)
            return newSet
          })
        }
        img.src = item.image || "/placeholder.svg"
      }
    }

    if (items.length > 0) {
      loadImagesSequentially()
    }
  }, [items])

  return (
    <div className="menu-items" id="menuItems">
      {items.map((item) => (
        <div
          key={item.id}
          className={item.isFeatured ? "featured-item" : "menu-item"}
          onClick={() => onItemClick(item)}
        >
          {item.isFeatured ? (
            <>
              <div className="featured-item-image-container">
                {loadingImages.has(item.id) && <div className="image-skeleton featured-skeleton"></div>}
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  className={`featured-item-image ${loadedImages.has(item.id) ? "image-loaded" : "image-loading"}`}
                  style={{ opacity: loadedImages.has(item.id) ? 1 : 0 }}
                />
              </div>
              <div className="featured-item-content">
                <h3>{item.name}</h3>
                <p className="featured-item-description">{item.description}</p>
                <p className="featured-item-price">{item.price}</p>
              </div>
            </>
          ) : (
            <>
              <div className="photo-item-image-container">
                {loadingImages.has(item.id) && <div className="image-skeleton regular-skeleton"></div>}
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  className={`photo-item-image ${loadedImages.has(item.id) ? "image-loaded" : "image-loading"}`}
                  style={{ opacity: loadedImages.has(item.id) ? 1 : 0 }}
                />
              </div>
              <div className="menu-item-content">
                <h3>{item.name}</h3>
                <p className="menu-item-description">{item.description}</p>
                <p className="menu-item-price">{item.price}</p>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
