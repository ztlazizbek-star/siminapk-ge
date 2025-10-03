export interface Product {
  id: number
  name: string
  description: string
  price: string
  image: string
  category: string
  isFeatured?: boolean
  isForKids?: boolean
  isForGroup?: boolean
  isNew?: boolean
  isHit?: boolean
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

    // Handle error response from API
    if (!data.success) {
      throw new Error(data.error || "Failed to fetch products")
    }

    // Get products from data.data
    const products = Array.isArray(data.data) ? data.data : []

    // Set first product as featured
    return products.map((product: Product, index: number) => ({
      ...product,
      isFeatured: index === 0,
    }))
  } catch (error) {
    console.error("[v0] Error in fetchProducts:", error)
    return []
  }
}

export function filterProductsByCategory(products: Product[], category: string): Product[] {
  let filteredProducts: Product[] = []

  if (category === "all") {
    filteredProducts = [...products]
  } else if (category === "kids") {
    filteredProducts = products.filter((product) => product.isForKids)
  } else if (category === "group") {
    filteredProducts = products.filter((product) => product.isForGroup)
  } else if (category === "new") {
    filteredProducts = products.filter((product) => product.isNew)
  } else if (category === "hot") {
    filteredProducts = products.filter((product) => product.isHit)
  } else {
    filteredProducts = products.filter((product) => product.category === category)
  }

  // Set first product as featured
  return filteredProducts.map((product, index) => ({
    ...product,
    isFeatured: index === 0,
  }))
}
