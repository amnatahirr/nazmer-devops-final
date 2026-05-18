"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, X, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

interface Product {
  _id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: string
  sku: string
  stock: number
  images: string[]
  sizes: string[]
  isActive: boolean
  details: {
    material: string
    care: string
    fit: string
    origin: string
  }
}

interface EditProductFormProps {
  productId: string
}

// Helper function to get full image URL
const getFullImageUrl = (imagePath: string) => {
  if (!imagePath) return ""

  // If it's already a full URL, return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath.replace(/^http:\/\//, "https://")
  }

  // Clean the path and construct full URL
  const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath
  const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}/${cleanPath}`

  return fullUrl
}

export default function EditProductForm({ productId }: EditProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState<Product>({
    _id: "",
    name: "",
    description: "",
    price: 0,
    originalPrice: 0,
    category: "",
    sku: "",
    stock: 0,
    images: [],
    sizes: [],
    isActive: true,
    details: {
      material: "",
      care: "",
      fit: "",
      origin: "",
    },
  })

  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [removedImages, setRemovedImages] = useState<string[]>([])

  const [categories, setCategories] = useState<Array<{ value: string; name: string }>>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  useEffect(() => {
    fetchProduct()
  }, [productId])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`)

      if (!response.ok) {
        console.error("Failed to fetch categories:", response.status)
        return
      }

      const data = await response.json()
      if (Array.isArray(data)) {
        setCategories(
          data.map((cat) => ({
            value: cat.value,
            name: cat.name,
          })),
        )
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setCategoriesLoading(false)
    }
  }

  useEffect(() => {
    // Convert existing image paths to full URLs for display
    if (formData.images && formData.images.length > 0) {
      const fullUrls = formData.images.map(getFullImageUrl)

      setExistingImages(fullUrls)
    }
  }, [formData.images])

  const fetchProduct = async () => {
    try {
      setFetchLoading(true)
      const token = localStorage.getItem("token")

      if (!token) {
        setError("No authentication token found")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const product = await response.json()

      setFormData({
        ...product,
        originalPrice: product.originalPrice || 0,
        sizes: product.sizes || [],
        details: {
          material: product.details?.material || "",
          care: product.details?.care || "",
          fit: product.details?.fit || "",
          origin: product.details?.origin || "",
        },
      })
    } catch (error) {
      console.error("Error fetching product:", error)
      setError("Failed to fetch product details")
    } finally {
      setFetchLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    if (name.startsWith("details.")) {
      const detailField = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          [detailField]: value,
        },
      }))
    } else {
      let processedValue: string | number = value

      if (type === "number") {
        if (name === "stock") {
          // For stock, use parseInt and ensure it's not negative
          processedValue = value === "" ? 0 : Math.max(0, Number.parseInt(value, 10) || 0)
        } else if (name === "price" || name === "originalPrice") {
          // For prices, use parseFloat
          processedValue = value === "" ? 0 : Math.max(0, Number.parseFloat(value) || 0)
        }
      }

      setFormData((prev) => ({
        ...prev,
        [name]: processedValue,
      }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        setImageFiles((prev) => [...prev, file])

        const reader = new FileReader()
        reader.onload = (e) => {
          setImageUrls((prev) => [...prev, e.target?.result as string])
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removeNewImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    const imageToRemove = formData.images[index]
    setRemovedImages((prev) => [...prev, imageToRemove])
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const addSize = () => {
    setFormData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, ""],
    }))
  }

  const updateSize = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.map((size, i) => (i === index ? value : size)),
    }))
  }

  const removeSize = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }))
  }

  // Upload new images to server
  const uploadNewImages = async () => {
    const uploadedUrls = []

    for (const file of imageFiles) {
      const formData = new FormData()
      formData.append("images", file)

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Failed to upload image")
        }

        const data = await response.json()
        if (data.images && data.images.length > 0) {
          // Store the relative path, not the full URL
          const relativePath = data.images[0].imageUrl.replace(`${process.env.NEXT_PUBLIC_API_URL}/`, "")
          uploadedUrls.push(relativePath)
        }
      } catch (error) {
        console.error("Error uploading image:", error)
        throw error
      }
    }

    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        setError("No authentication token found")
        return
      }

      // Upload new images first
      let newImageUrls = []
      if (imageFiles.length > 0) {
        newImageUrls = await uploadNewImages()
      }

      // Combine existing images (that weren't removed) with new uploaded images
      const allImages = [...formData.images, ...newImageUrls]

      // Prepare the update data with proper number types
      const updateData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        category: formData.category,
        sku: formData.sku,
        stock: Number(formData.stock), // Ensure stock is a number
        isActive: formData.isActive,
        images: allImages,
        sizes: formData.sizes.filter((size) => size.trim() !== ""), // Remove empty sizes
        details: formData.details,
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/${productId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update product")
      }

      const result = await response.json()

      router.push("/admin/products")
    } catch (error) {
      console.error("Error updating product:", error)
      setError(error instanceof Error ? error.message : "Failed to update product")
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading product details...</div>
        </div>
      </div>
    )
  }

  if (error && fetchLoading) {
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="text-gray-600 mt-2">Update product information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the basic details of your product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="sku">SKU *</Label>
                <Input id="sku" name="sku" value={formData.sku} onChange={handleInputChange} required />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: string) => handleSelectChange("category", value)}
                disabled={categoriesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select a category"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Pricing and Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Inventory</CardTitle>
            <CardDescription>Set pricing and stock information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Price (PKR) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="originalPrice">Original Price (PKR)</Label>
                <Input
                  id="originalPrice"
                  name="originalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.originalPrice || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Current stock: {formData.stock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Details */}
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>Additional product information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="details.material">Material *</Label>
                <Input
                  id="details.material"
                  name="details.material"
                  value={formData.details.material}
                  onChange={handleInputChange}
                  placeholder="e.g., 100% Cotton"
                  required
                />
              </div>
              <div>
                <Label htmlFor="details.care">Care Instructions *</Label>
                <Input
                  id="details.care"
                  name="details.care"
                  value={formData.details.care}
                  onChange={handleInputChange}
                  placeholder="e.g., Machine wash cold"
                  required
                />
              </div>
              <div>
                <Label htmlFor="details.fit">Fit *</Label>
                <Input
                  id="details.fit"
                  name="details.fit"
                  value={formData.details.fit}
                  onChange={handleInputChange}
                  placeholder="e.g., Regular fit"
                  required
                />
              </div>
              <div>
                <Label htmlFor="details.origin">Origin *</Label>
                <Input
                  id="details.origin"
                  name="details.origin"
                  value={formData.details.origin}
                  onChange={handleInputChange}
                  placeholder="e.g., Made in Pakistan"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images *</CardTitle>
            <CardDescription>Upload product images (first image will be the main image)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button type="button" variant="outline" onClick={() => document.getElementById("image-upload")?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Upload from Device
              </Button>
              <input
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Current Images</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {existingImages.map((imageUrl, index) => (
                    <div key={`existing-${index}`} className="relative group">
                      <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                        <img
                          src={imageUrl || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            console.error("Existing image failed to load:", imageUrl)
                            e.currentTarget.src = "/placeholder.svg?height=200&width=200"
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeExistingImage(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            {imageUrls.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">New Images</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`New Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeNewImage(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Sizes */}
        <Card>
          <CardHeader>
            <CardTitle>Available Sizes</CardTitle>
            <CardDescription>Add available sizes for this product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.sizes.map((size, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={size}
                  onChange={(e) => updateSize(index, e.target.value)}
                  placeholder="Enter size (e.g., S, M, L, XL)"
                />
                <Button type="button" variant="outline" size="sm" onClick={() => removeSize(index)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addSize}>
              <Plus className="w-4 h-4 mr-2" />
              Add Size
            </Button>
          </CardContent>
        </Card>

        {/* Product Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Product Settings</CardTitle>
            <CardDescription>Configure product visibility and features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleCheckboxChange("isActive", checked as boolean)}
              />
              <Label htmlFor="isActive">Product is active (visible to customers)</Label>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-[#8B7355] hover:bg-[#7A6449]">
            {loading ? "Updating..." : "Update Product"}
          </Button>
        </div>
      </form>
    </div>
  )
}
