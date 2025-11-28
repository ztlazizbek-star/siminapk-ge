import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { phone, orderDetails } = await request.json()

    console.log("[v0] Order Success SMS API called with phone:", phone)

    // Формируем сообщение для SMS
    const message = `Ваш заказ успешно оформлен! Общая сумма: ${orderDetails.totalPrice} TJS. Cafe Simin благодарит вас!`

    const smsApiUrl = "https://tajstore.ru/simin/sms.php"

    const response = await fetch(smsApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: phone,
        message: message,
      }),
    })

    const data = await response.json()
    console.log("[v0] Order Success SMS API response:", data)

    if (data.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: data.error || "Ошибка отправки SMS" }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] Order Success SMS API error:", error)
    return NextResponse.json({ success: false, error: "Ошибка сервера" }, { status: 500 })
  }
}
