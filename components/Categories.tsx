"use client"

interface Category {
  slug: string
  name: string
  icon: string
}

interface Subcategory {
  slug: string
  name: string
}

interface CategoriesProps {
  categories: Category[]
  subcategories: Subcategory[]
  activeCategory: string
  activeSubcategory: string
  onCategoryChange: (category: string) => void
  onSubcategoryChange: (subcategory: string) => void
}

export default function Categories({
  categories,
  subcategories,
  activeCategory,
  activeSubcategory,
  onCategoryChange,
  onSubcategoryChange,
}: CategoriesProps) {
  return (
    <>
      <div className="top-categories-container">
        {categories.map((category) => (
          <button
            key={category.slug}
            className={`top-category-btn ${activeCategory === category.slug ? "active" : ""}`}
            onClick={() => onCategoryChange(category.slug)}
          >
            <div className="top-category-icon-container">
              <img src={category.icon || "/placeholder.svg"} alt={category.name} className="top-category-icon" />
            </div>
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      <div className="subcategories-container" id="subcategoriesContainer">
        {subcategories.map((subcategory) => (
          <button
            key={subcategory.slug}
            className={`subcategory-btn ${activeSubcategory === subcategory.slug ? "active" : ""}`}
            onClick={() => onSubcategoryChange(subcategory.slug)}
          >
            <span>{subcategory.name}</span>
          </button>
        ))}
      </div>
    </>
  )
}
