export interface Product {
  id: number
  name: string
  description: string
  price: string
  image: string
  category: string
  top_category?: string
  subcategory?: string
  isFeatured?: boolean
  isForKids?: boolean
  isForGroup?: boolean
  isNew?: boolean
  isHit?: boolean
  available?: number
  created_at?: string
  updated_at?: string
}

export async function fetchProducts(category = "all"): Promise<Product[]> {
  try {
    const apiUrl =
      category === "all"
        ? "https://tajstore.ru/simin/index.php"
        : `https://tajstore.ru/simin/index.php?category=${category}`

    console.log("[v0] Fetching from API:", apiUrl)

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    console.log("[v0] API response status:", response.status)

    if (!response.ok) {
      console.error("[v0] API responded with status:", response.status)
      throw new Error(`Failed to fetch products: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] API data received:", data)

    if (!data.success) {
      throw new Error(data.error || "Failed to fetch products")
    }

    const products = Array.isArray(data.data) ? data.data : []

    return products.map((product: Product, index: number) => ({
      ...product,
      isFeatured: index === 0,
    }))
  } catch (error) {
    console.error("[v0] Error in fetchProducts:", error)
    return []
  }
}

export function filterProductsByCategory(products: Product[], category: string, subcategory?: string): Product[] {
  let filteredProducts: Product[] = []

  // First filter by top category
  if (category === "all") {
    filteredProducts = [...products]
  } else if (category === "kids" || category === "group" || category === "new" || category === "hot") {
    // Filter by top_category field from database
    filteredProducts = products.filter((product) => product.top_category === category)
  } else {
    // Fallback to category field
    filteredProducts = products.filter((product) => product.category === category)
  }

  // Then filter by subcategory if provided
  if (subcategory && subcategory !== "all") {
    filteredProducts = filteredProducts.filter((product) => product.subcategory === subcategory)
  }

  // Set first product as featured
  return filteredProducts.map((product, index) => ({
    ...product,
    isFeatured: index === 0,
  }))
}
