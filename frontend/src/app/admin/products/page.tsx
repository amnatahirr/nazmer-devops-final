"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Eye, Trash2, Plus, Search, Filter } from "lucide-react"
import Link from "next/link"

interface Product {
  _id: string
  name: string
  sku: string
  category: string
  price: number
  stock: number
  isActive: boolean
  images: string[]
  createdAt: string
}

// Helper function to get full image URL
const getFullImageUrl = (imagePath: string) => {
  if (!imagePath) return "/placeholder.svg?height=50&width=50"

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath.replace(/^http:\/\//, "https://");
  }

  const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath
  const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}/${cleanPath}`

  return fullUrl
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("")

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      if (!token) {
        setError("No authentication token found")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()


      // Ensure products is always an array
      setProducts(Array.isArray(data) ? data : data.products || [])
    } catch (error) {
      console.error("Error fetching products:", error)
      setError("Failed to fetch products")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to delete product")
      }

      setProducts(products.filter((product) => product._id !== productId))
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Failed to delete product")
    }
  }

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product/${productId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: !currentStatus }),
        },
      )

      if (!response.ok) {
        throw new Error("Failed to update product status")
      }

      setProducts(
        products.map((product) => (product._id === productId ? { ...product, isActive: !currentStatus } : product)),
      )
    } catch (error) {
      console.error("Error updating product status:", error)
      alert("Failed to update product status")
    }
  }

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "" || product.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(products.map((product) => product.category))]

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading products...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-600 mt-2">Manage your product inventory</p>
        </div>
        <Link href="/admin/add-product">
          <Button className="bg-[#8B7355] hover:bg-[#7A6449]">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Search & Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
          <CardDescription>A list of all products in your store</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <img
                        src={getFullImageUrl(product.images?.[0])}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-md"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=50&width=50"
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>PKR {product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <Badge
                        variant={product.isActive ? "default" : "secondary"}
                        className={product.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/products/edit/${product._id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleProductStatus(product._id, product.isActive)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
