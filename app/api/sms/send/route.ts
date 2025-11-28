import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { phone, code } = await request.json()

    console.log("[v0] SMS send API called")
    console.log("[v0] Phone:", phone)
    console.log("[v0] Code:", code)

    const smsApiUrl = "https://tajstore.ru/simin/sms.php"

    const requestBody = {
      phone: phone,
      code: code,
      type: "verification",
    }

    console.log("[v0] Sending request to:", smsApiUrl)
    console.log("[v0] Request body:", JSON.stringify(requestBody))

    const response = await fetch(smsApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    console.log("[v0] Server response status:", response.status)

    const data = await response.json()
    console.log("[v0] Server response data:", JSON.stringify(data))

    if (data.success) {
      if (data.dev_mode) {
        console.log("[v0] WARNING: SMS API в режиме разработки!")
        console.log("[v0] SMS не отправлено реально")
      }
      return NextResponse.json({ success: true, dev_mode: data.dev_mode })
    } else {
      console.error("[v0] SMS API returned error:", data.error)
      return NextResponse.json({ success: false, error: data.error || "Ошибка отправки SMS" }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] SMS API error:", error)
    return NextResponse.json({ success: false, error: "Ошибка сервера" }, { status: 500 })
  }
}
