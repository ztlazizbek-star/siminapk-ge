import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") || "all"

    const response = await fetch(`https://tajstore.ru/simin?category=${category}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Disable caching to always get fresh data
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()

    // Return the products data
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error fetching products from API:", error)

    // Return error response
    return NextResponse.json(
      { error: "Failed to fetch products", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
