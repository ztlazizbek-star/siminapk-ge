import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { UserProvider } from "./contexts/UserContext"
import { CartProvider } from "./contexts/CartContext"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata = {
  title: "Cafe Simin",
  description: "Лучшее кафе в городе",
    generator: 'v0.app'
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={inter.className}>
        <UserProvider>
          <CartProvider>{children}</CartProvider>
        </UserProvider>
      </body>
    </html>
  )
}
