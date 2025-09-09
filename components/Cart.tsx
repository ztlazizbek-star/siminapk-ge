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

  if (!cart || cart.length === 0) {
    return null
  }

  return (
    <div id="cartIcon" className="cart-icon-container">
      <div className="cart-icon" onClick={onCartClick}>
        <i className="fas fa-shopping-bag"></i>
        <span id="cartTotal" className="cart-total">
          {totalPrice.toFixed(2)} TJS
        </span>
      </div>
    </div>
  )
}
