import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(priceString: string): string {
  if (!priceString || typeof priceString !== "string") return "0 TJS"

  // Extract numeric value from price string
  const cleanedPrice = priceString.replace("от ", "").replace(" TJS.", "").replace(" TJS", "")
  const numericPrice = Number.parseFloat(cleanedPrice)

  if (isNaN(numericPrice)) return priceString

  // If it's a whole number, don't show decimals
  if (numericPrice % 1 === 0) {
    return `${numericPrice} TJS`
  }

  // Otherwise show up to 2 decimal places, removing trailing zeros
  return `${numericPrice.toFixed(2).replace(/\.?0+$/, "")} TJS`
}
