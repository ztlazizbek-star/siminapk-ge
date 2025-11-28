import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { phone, orderDetails } = await request.json()

    console.log("[v0] Order Success SMS API called with phone:", phone)
    console.log("[v0] Order details:", orderDetails)

    const message = `Ваш заказ успешно оформлен! Общая сумма: ${orderDetails.totalPrice} TJS. Cafe Simin благодарит вас!`

    const smsApiUrl = "https://tajstore.ru/simin/sms.php"

    const requestBody = {
      phone: phone,
      message: message, // Используем поле 'message' для уведомлений
      type: "notification", // Указываем тип уведомления
    }

    console.log("[v0] Sending SMS request with body:", JSON.stringify(requestBody))

    const response = await fetch(smsApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    const data = await response.json()
    console.log("[v0] Order Success SMS API response status:", response.status)
    console.log("[v0] Order Success SMS API response:", JSON.stringify(data))

    if (data.success) {
      return NextResponse.json({ success: true })
    } else {
      console.error("[v0] SMS API returned error:", data.error)
      return NextResponse.json({ success: false, error: data.error || "Ошибка отправки SMS" }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] Order Success SMS API error:", error)
    return NextResponse.json({ success: false, error: "Ошибка сервера" }, { status: 500 })
  }
}
