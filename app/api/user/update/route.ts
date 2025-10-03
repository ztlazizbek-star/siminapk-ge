import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, address } = body

    console.log("[v0] Update API called with:", { name, phone, address })

    if (!name || !phone || !address) {
      return NextResponse.json({ success: false, error: "Все поля обязательны" }, { status: 400 })
    }

    const payload = {
      action: "update",
      name,
      phone,
      address,
    }
    console.log("[v0] Sending to PHP API:", payload)

    // Отправляем запрос на PHP API
    const response = await fetch("https://tajstore.ru/simin/user.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    console.log("[v0] PHP API response status:", response.status)
    const data = await response.json()
    console.log("[v0] PHP API response data:", data)

    if (data.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: data.error || "Ошибка обновления данных" }, { status: 500 })
    }
  } catch (error) {
    console.error("[v0] Error updating user:", error)
    return NextResponse.json({ success: false, error: "Ошибка сервера" }, { status: 500 })
  }
}
