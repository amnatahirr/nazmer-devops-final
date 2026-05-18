"use client"

import { useState, type ChangeEvent, type FormEvent, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Upload, ImageIcon } from "lucide-react"

interface ProductFormData {
  name: string
  price: string
  originalPrice: string
  sku: string
  description: string
  images: (string | File)[]
  sizes: string[]
  category: string
  stock: string
  details: {
    material: string
    care: string
    fit: string
    origin: string
  }
}

const availableSizes = ["XS", "S", "M", "L", "XL", "XXL"]

// Define the backend base URL
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export default function AddProductForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: "",
    originalPrice: "",
    sku: "",
    description: "",
    images: [],
    sizes: [],
    category: "",
    stock: "0",
    details: {
      material: "",
      care: "",
      fit: "",
      origin: "",
    },
  })
  const [errors, setErrors] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [categories, setCategories] = useState<Array<{ value: string; name: string }>>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

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
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    setErrors((prev: any) => ({ ...prev, [name]: "" }))
  }

  // Generate SKU automatically based on product name and category
  const generateSKU = () => {
    if (formData.name && formData.category) {
      const namePrefix = formData.name.substring(0, 3).toUpperCase()
      const categoryPrefix = formData.category.substring(0, 3).toUpperCase()
      const randomNum = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")
      const generatedSKU = `${namePrefix}-${categoryPrefix}-${randomNum}`

      setFormData((prev) => ({ ...prev, sku: generatedSKU }))
    }
  }

  // Handle file upload
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const result = event.target?.result as string
          setImagePreviews((prev) => [...prev, result])
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, file],
          }))
        }
        reader.onerror = (error) => {
          // Added error handling for FileReader
          console.error("Error reading file:", error)
          alert("Failed to read image file. Please try another file.")
        }
        reader.readAsDataURL(file)
      } else {
        alert(`File "${file.name}" is not an image. Only image files are allowed.`)
      }
    })

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Handle URL input for images
  const handleImageUrlAdd = () => {
    const url = prompt("Enter direct image URL (e.g., ending in .jpg, .png, .gif):")
    if (url && url.trim()) {
      const lowerCaseUrl = url.toLowerCase()
      const isDirectImage =
        lowerCaseUrl.endsWith(".jpg") ||
        lowerCaseUrl.endsWith(".jpeg") ||
        lowerCaseUrl.endsWith(".png") ||
        lowerCaseUrl.endsWith(".gif") ||
        lowerCaseUrl.endsWith(".webp") ||
        lowerCaseUrl.endsWith(".svg")

      if (!isDirectImage) {
        alert(
          "The URL does not appear to be a direct image link. Please ensure it ends with an image file extension (.jpg, .png, etc.).",
        )
        return
      }

      setImagePreviews((prev) => [...prev, url.trim()])
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, url.trim()],
      }))
    }
  }

  // Remove image
  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleSizeToggle = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size],
    }))
  }

  // Upload image to server
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("images", file) // Changed from 'image' to 'images'

    const response = await fetch(`${BACKEND_BASE_URL}/api/upload`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      let errorMessage = "Failed to upload image."
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch (jsonError) {
        console.error("Error parsing upload error response:", jsonError)
        errorMessage = `Failed to upload image. Server responded with status ${response.status}.`
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    if (data.images && data.images.length > 0) {
      return data.images[0].imageUrl // Access the first image from the array
    } else {
      throw new Error("Image upload successful, but no image URL returned.")
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      // Optional: Check if user is logged in (remove if you want anyone to add products)
      if (!token) {
        alert("Please login to add products.")
        router.push("/login")
        return
      }

      // Upload images and get URLs
      const imageUrls: string[] = []

      for (const image of formData.images) {
        if (typeof image === "string") {
          // It's already a URL, ensure it's a relative path for the backend
          imageUrls.push(image.replace(BACKEND_BASE_URL, ""))
        } else {
          // It's a File, upload it
          try {
            const uploadedUrl = await uploadImage(image)
            imageUrls.push(uploadedUrl)
          } catch (error: any) {
            // Catch specific error type
            console.error("Error uploading image:", error.message, error) // Log full error
            alert(`Failed to upload image: ${error.message}. Please try again.`)
            setIsLoading(false)
            return
          }
        }
      }

      const productData = {
        ...formData,
        price: Number.parseFloat(formData.price),
        originalPrice: formData.originalPrice ? Number.parseFloat(formData.originalPrice) : undefined,
        stock: Number.parseInt(formData.stock),
        images: imageUrls,
      }

      const response = await fetch(`${BACKEND_BASE_URL}/api/product`, {
        // Changed to singular /api/product
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(productData),
      })

      const data = await response.json()

      if (response.ok) {
        alert("Product added successfully!")
        router.push("/admin/products") // Redirect to admin products page
      } else {
        if (data.errors) {
          const newErrors: any = {}
          data.errors.forEach((error: any) => {
            if (error.path) {
              newErrors[error.path] = error.msg
            }
          })
          setErrors(newErrors)
          alert(`Validation failed: ${data.errors.map((e: any) => e.msg).join(", ")}`)
        } else {
          alert(data.message || "Failed to add product. Please check the form and try again.")
        }
      }
    } catch (error) {
      console.error("Add product submission error:", error)
      alert("An unexpected error occurred during product submission. Please check your network and try again.")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm">
        <h1 className="text-3xl font-light text-gray-900 mb-8 text-center">Add New Product</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SKU (Stock Keeping Unit) *</label>
              <div className="flex space-x-2">
                <Input
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="e.g., SHIRT-COT-001"
                  className={`flex-1 ${errors.sku ? "border-red-500" : ""}`}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateSKU}
                  disabled={!formData.name || !formData.category}
                >
                  Generate
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Unique identifier for inventory tracking</p>
              {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-beige_dark ${
                errors.category ? "border-red-500" : "border-gray-300"
              }`}
              disabled={categoriesLoading}
            >
              <option value="">{categoriesLoading ? "Loading categories..." : "Select Category"}</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price ($) *</label>
              <Input
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Original Price ($)</label>
              <Input
                name="originalPrice"
                type="number"
                step="0.01"
                value={formData.originalPrice}
                onChange={handleChange}
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty if no discount</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
              <Input
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                className={errors.stock ? "border-red-500" : ""}
              />
              {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Enter detailed product description"
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-beige_dark ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Images *</label>

            {/* Image Upload Options */}
            <div className="flex space-x-4 mb-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Upload from Device</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleImageUrlAdd}
                className="flex items-center space-x-2 bg-transparent"
              >
                <ImageIcon className="h-4 w-4" />
                <span>Add Image URL</span>
              </Button>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-52 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {imagePreviews.length === 0 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No images added yet</p>
                <p className="text-sm text-gray-400">Upload from device or add image URLs</p>
              </div>
            )}
          </div>

          {/* Sizes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Available Sizes</label>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeToggle(size)}
                  className={`px-4 py-2 border rounded text-sm font-medium transition-colors ${
                    formData.sizes.includes(size)
                      ? "border-beige_dark bg-beige_dark text-white"
                      : "border-gray-300 text-gray-700 hover:border-beige_dark"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Select all applicable sizes for this product</p>
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Material *</label>
              <Input
                name="details.material"
                value={formData.details.material}
                onChange={handleChange}
                placeholder="e.g., 100% Organic Cotton"
                className={errors["details.material"] ? "border-red-500" : ""}
              />
              {errors["details.material"] && <p className="text-red-500 text-sm mt-1">{errors["details.material"]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Care Instructions *</label>
              <Input
                name="details.care"
                value={formData.details.care}
                onChange={handleChange}
                placeholder="e.g., Machine wash cold, tumble dry low"
                className={errors["details.care"] ? "border-red-500" : ""}
              />
              {errors["details.care"] && <p className="text-red-500 text-sm mt-1">{errors["details.care"]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fit Type *</label>
              <select
                name="details.fit"
                value={formData.details.fit}
                onChange={handleChange}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-beige_dark ${
                  errors["details.fit"] ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select Fit</option>
                <option value="Slim fit">Slim fit</option>
                <option value="Regular fit">Regular fit</option>
                <option value="Relaxed fit">Relaxed fit</option>
                <option value="Oversized fit">Oversized fit</option>
                <option value="A-line fit">A-line fit</option>
                <option value="Tailored fit">Tailored fit</option>
              </select>
              {errors["details.fit"] && <p className="text-red-500 text-sm mt-1">{errors["details.fit"]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Origin *</label>
              <Input
                name="details.origin"
                value={formData.details.origin}
                onChange={handleChange}
                placeholder="e.g., Made in Pakistan"
                className={errors["details.origin"] ? "border-red-500" : ""}
              />
              {errors["details.origin"] && <p className="text-red-500 text-sm mt-1">{errors["details.origin"]}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.push("/")}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || imagePreviews.length === 0}
              className="bg-beige_dark hover:bg-third text-white"
            >
              {isLoading ? "Adding Product..." : "Add Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
