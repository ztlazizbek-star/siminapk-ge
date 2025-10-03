import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, address } = body

    if (!name || !phone || !address) {
      return NextResponse.json({ success: false, error: "Все поля обязательны" }, { status: 400 })
    }

    // Отправляем запрос на PHP API
    const response = await fetch("https://tajstore.ru/simin/user.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "update",
        name,
        phone,
        address,
      }),
    })

    const data = await response.json()

    if (data.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: data.error || "Ошибка обновления данных" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ success: false, error: "Ошибка сервера" }, { status: 500 })
  }
}
