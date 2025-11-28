import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { phone, code } = await request.json()

    console.log("[v0] SMS API called with phone:", phone, "code:", code)

    const smsApiUrl = "https://tajstore.ru/simin/sms.php"

    const response = await fetch(smsApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: phone,
        code: code,
        type: "verification", // Указываем тип для кодов верификации
      }),
    })

    const data = await response.json()
    console.log("[v0] SMS API response:", data)

    if (data.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: data.error || "Ошибка отправки SMS" }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] SMS API error:", error)
    return NextResponse.json({ success: false, error: "Ошибка сервера" }, { status: 500 })
  }
}
