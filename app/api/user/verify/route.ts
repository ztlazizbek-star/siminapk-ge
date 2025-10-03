import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone } = body

    if (!phone) {
      return NextResponse.json({ success: false, error: "Номер телефона обязателен" }, { status: 400 })
    }

    // Проверка пользователя в базе данных через PHP API
    const response = await fetch("https://tajstore.ru/simin/user.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "verify",
        phone,
      }),
    })

    const data = await response.json()

    if (!data.success) {
      return NextResponse.json({ success: false, exists: false })
    }

    return NextResponse.json({
      success: true,
      exists: true,
      user: data.user,
    })
  } catch (error) {
    console.error("Verify error:", error)
    return NextResponse.json({ success: false, exists: false }, { status: 500 })
  }
}
