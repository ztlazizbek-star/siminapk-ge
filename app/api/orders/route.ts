import { type NextRequest, NextResponse } from "next/server"
import mysql from "mysql2/promise"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get("phone")

    if (!phone) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 })
    }

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number.parseInt(process.env.DB_PORT || "3306"),
    })

    const [rows] = await connection.execute(
      "SELECT * FROM orders WHERE user_phone = ? ORDER BY created_at DESC LIMIT 20",
      [phone],
    )

    await connection.end()

    return NextResponse.json({ success: true, orders: rows })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, name, orderType, deliveryAddress, paymentType, items, totalPrice } = body

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number.parseInt(process.env.DB_PORT || "3306"),
    })

    const [result] = await connection.execute(
      "INSERT INTO orders (user_phone, user_name, order_type, delivery_address, payment_type, items, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [phone, name, orderType, deliveryAddress, paymentType, JSON.stringify(items), totalPrice, "pending"],
    )

    await connection.end()

    return NextResponse.json({ success: true, orderId: (result as any).insertId })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
