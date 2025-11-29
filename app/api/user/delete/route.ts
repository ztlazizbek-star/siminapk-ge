import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    console.log("[v0] Delete API called with phone:", phone)

    if (!phone) {
      console.log("[v0] Delete API: Phone is missing")
      return NextResponse.json({ success: false, error: "Номер телефона обязателен" }, { status: 400 })
    }

    console.log("[v0] Delete API: Calling external API...")
    const response = await fetch("https://tajstore.ru/simin/user.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "delete",
        phone,
      }),
    })

    const data = await response.json()
    console.log("[v0] Delete API: External API response:", data)

    if (!data.success) {
      console.log("[v0] Delete API: External API returned error:", data.error)
      return NextResponse.json({ success: false, error: data.error || "Ошибка удаления аккаунта" }, { status: 400 })
    }

    console.log("[v0] Delete API: User deleted successfully")

    return NextResponse.json({
      success: true,
      message: "Аккаунт успешно удален",
    })
  } catch (error) {
    console.error("[v0] Error deleting user:", error)
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
