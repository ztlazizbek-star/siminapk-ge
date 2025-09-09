"use client"

interface CartItem {
  id: number
  name: string
  price: string
  quantity: number
}

interface CartProps {
  cart: CartItem[]
  onCartClick: () => void
}

export default function Cart({ cart, onCartClick }: CartProps) {
  const getNumericPrice = (priceString: string): number => {
    if (typeof priceString === "number") return priceString
    if (!priceString || typeof priceString !== "string") return 0
    const cleanedPrice = priceString.replace("от ", "").replace(" TJS.", "").replace(" TJS", "")
    const result = Number.parseFloat(cleanedPrice)
    return isNaN(result) ? 0 : result
  }

  const totalPrice = cart.reduce((sum, item) => {
    const quantity = item.quantity || 1
    const price = getNumericPrice(item.price)
    return sum + price * quantity
  }, 0)

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0)

  if (!cart || cart.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-4 shadow-lg cursor-pointer transition-all duration-300 flex items-center gap-3 min-w-[120px]"
        onClick={onCartClick}
      >
        <div className="relative">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z" />
            <path d="M9 8V17H11V8H9ZM13 8V17H15V8H13Z" />
          </svg>
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
        </div>
        <span className="font-semibold text-sm whitespace-nowrap">{totalPrice.toFixed(2)} TJS</span>
      </div>
    </div>
  )
}
