import { type NextRequest, NextResponse } from "next/server"
import mysql from "mysql2/promise"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_phone, items, total_price, order_type, payment_type, delivery_address, comment } = body

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT) || 3306,
    })

    const [result] = await connection.execute(
      `INSERT INTO orders (user_phone, items, total_price, order_type, payment_type, delivery_address, comment, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [user_phone, JSON.stringify(items), total_price, order_type, payment_type, delivery_address || "", comment || ""],
    )

    await connection.end()

    return NextResponse.json({ success: true, orderId: (result as any).insertId })
  } catch (error) {
    console.error("[v0] Error creating order:", error)
    return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 })
  }
}
