import { NextResponse } from "next/server"

const normalizePhoneNumber = (phone: string): string => {
  let normalized = phone.replace(/\D/g, "")
  if (normalized.startsWith("992")) {
    normalized = normalized.slice(3)
  }
  return normalized
}

export async function POST(request: Request) {
  try {
    const { phone, orderDetails } = await request.json()

    console.log("[v0] Order Success SMS API called with phone:", phone)
    console.log("[v0] Order details:", orderDetails)

    const normalizedPhone = normalizePhoneNumber(phone)
    console.log("[v0] Normalized phone:", normalizedPhone)

    const message = `Фармоиши Шумо кабул карда шуд.Арзиши фармоиши Шумо: ${orderDetails.totalPrice} TJS-ро ташкил медихад. Сипосгузорем,ки Cafe Simin -ро интихоб намудед!`

    const smsApiUrl = "https://tajstore.ru/simin/sms.php"

    const requestBody = {
      phone: normalizedPhone,
      code: message,
      type: "notification",
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

    const isDevMode =
      data.dev_mode === true || data.status === "ok" || (data.message && data.message.includes("DEV MODE"))

    if (isDevMode) {
      console.warn("[v0] SMS API is in DEV MODE - SMS will not be sent. Code:", data.code || message)
      return NextResponse.json({
        success: true,
        dev_mode: true,
        message: "Заказ оформлен (SMS в режиме разработки)",
      })
    }

    if (data.success) {
      console.log("[v0] SMS sent successfully")
      return NextResponse.json({ success: true, message: "Заказ оформлен успешно" })
    } else {
      // Логируем ошибку, но всё равно возвращаем успех
      const errorMessage = data.error || data.message || "Ошибка отправки SMS"
      console.warn("[v0] SMS sending failed:", errorMessage, "- but order is still successful")
      return NextResponse.json({
        success: true,
        sms_failed: true,
        message: "Заказ оформлен успешно (SMS не отправлено)",
      })
    }
  } catch (error) {
    console.error("[v0] Order Success SMS API error:", error, "- but order is still successful")
    return NextResponse.json({
      success: true,
      sms_failed: true,
      message: "Заказ оформлен успешно (SMS не отправлено)",
    })
  }
}
