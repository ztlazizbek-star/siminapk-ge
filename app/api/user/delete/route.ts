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
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
      console.error("[v0] Database environment variables are missing")
      return NextResponse.json({ success: false, error: "Ошибка конфигурации сервера" }, { status: 500 })
    }

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number.parseInt(process.env.DB_PORT || "3306"),
    })

    console.log("[v0] Delete API: Database connected successfully")
    console.log("[v0] Delete API: Executing DELETE query for phone:", phone)

    const [result]: any = await connection.execute("DELETE FROM users WHERE phone = ?", [phone])

    console.log("[v0] Delete API: Query executed")
    console.log("[v0] Delete API: Affected rows:", result.affectedRows)
    console.log("[v0] Delete API: Full result:", JSON.stringify(result))

    await connection.end()

    if (result.affectedRows === 0) {
      console.log("[v0] Delete API: No user found with phone:", phone)
      return NextResponse.json(
        {
          success: false,
          error: "Пользователь не найден",
        },
        { status: 404 },
      )
    }

    console.log("[v0] Delete API: User deleted successfully")

    return NextResponse.json({
      success: true,
      message: "Аккаунт успешно удален",
      deletedRows: result.affectedRows,
    })
  } catch (error) {
    console.error("[v0] Error deleting user:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    console.error("[v0] Error details:", error instanceof Error ? error.message : "Unknown error")

    return NextResponse.json(
      {
        success: false,
        error: `Ошибка при удалении аккаунта: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
      },
      { status: 500 },
    )
  }
}
