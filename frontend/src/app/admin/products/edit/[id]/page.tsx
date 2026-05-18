"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import EditProductForm from "@/components/admin/EditProductForm"
import type { ProductFormData } from "@/components/admin/EditProductForm" // Import the type

export default function EditProductPage() {
  const params = useParams()
  const productId = params.id as string
  const [product, setProduct] = useState<ProductFormData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError("Invalid Product ID")
        setLoading(false)
        return
      }

      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to fetch product")
        }

        const data = await response.json()
        setProduct({
          name: data.name,
          price: data.price.toString(),
          originalPrice: data.originalPrice?.toString() || "",
          sku: data.sku,
          description: data.description,
          images: data.images || [],
          sizes: data.sizes || [],
          category: data.category,
          stock: data.stock.toString(),
          details: {
            material: data.details?.material || "",
            care: data.details?.care || "",
            fit: data.details?.fit || "",
            origin: data.details?.origin || "",
          },
        })
      } catch (err: any) {
        console.error("Error fetching product:", err)
        setError(err.message || "An error occurred while fetching product details.")
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [productId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-beige_dark"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          <p className="text-lg">{error}</p>
          <p className="mt-2 text-gray-500">Please try again or check the product ID.</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-600">
          <p className="text-lg">Product Not Found</p>
          <p className="mt-2 text-gray-500">The product you are looking for does not exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <EditProductForm initialProductData={product} productId={productId} />
    </div>
  )
}
