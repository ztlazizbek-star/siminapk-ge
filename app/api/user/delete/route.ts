import { type NextRequest, NextResponse } from "next/server"
import mysql from "mysql2/promise"

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    console.log("[v0] Delete API called with phone:", phone)

    if (!phone) {
      console.log("[v0] Delete API: Phone is missing")
      return NextResponse.json({ success: false, error: "Номер телефона обязателен" }, { status: 400 })
    }

    console.log("[v0] Delete API: Connecting to database...")
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number.parseInt(process.env.DB_PORT || "3306"),
    })

    console.log("[v0] Delete API: Executing DELETE query...")
    // Delete user from database
    const [result] = await connection.execute("DELETE FROM users WHERE phone = ?", [phone])

    console.log("[v0] Delete API: Query result:", result)

    await connection.end()
    console.log("[v0] Delete API: User deleted successfully")

    return NextResponse.json({
      success: true,
      message: "Аккаунт успешно удален",
    })
  } catch (error) {
    console.error("[v0] Error deleting user:", error)
    console.error("[v0] Error details:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ success: false, error: "Ошибка при удалении аккаунта" }, { status: 500 })
  }
}
