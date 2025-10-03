import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, address } = body

    // Валидация
    if (!name || !phone || !address) {
      return NextResponse.json({ success: false, error: "Все поля обязательны" }, { status: 400 })
    }

    const response = await fetch("https://tajstore.ru/simin/user.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "register",
        name,
        phone,
        address,
      }),
    })

    const data = await response.json()

    if (!data.success) {
      return NextResponse.json({ success: false, error: data.error || "Ошибка регистрации" }, { status: 400 })
    }

    const user = {
      name,
      phone,
      address,
      profilePhoto: null,
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, error: "Ошибка регистрации" }, { status: 500 })
  }
}
