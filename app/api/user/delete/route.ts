import { type NextRequest, NextResponse } from "next/server"
import mysql from "mysql2/promise"

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ success: false, error: "Номер телефона обязателен" }, { status: 400 })
    }

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number.parseInt(process.env.DB_PORT || "3306"),
    })

    // Delete user from database
    const [result] = await connection.execute("DELETE FROM users WHERE phone = ?", [phone])

    await connection.end()

    return NextResponse.json({
      success: true,
      message: "Аккаунт успешно удален",
    })
  } catch (error) {
    console.error("[v0] Error deleting user:", error)
    return NextResponse.json({ success: false, error: "Ошибка при удалении аккаунта" }, { status: 500 })
  }
}
