"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  images: string[];
  isActive: boolean;
  isNewArrival: boolean;
}

// Helper function to get full image URL
const getFullImageUrl = (imagePath: string) => {
  if (!imagePath) return "/placeholder.svg?height=100&width=100";

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath.replace(/^http:\/\//, "https://");
  }

  const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
  return `${process.env.NEXT_PUBLIC_API_URL}/${cleanPath}`;
};

export default function NewArrivalsManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login?redirect=/admin/new-arrivals");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product/admin-all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const productsArray = Array.isArray(data) ? data : data.products || [];
      setProducts(productsArray);

      // Set currently selected new arrivals
      const currentNewArrivals = productsArray
        .filter((product: Product) => product.isNewArrival)
        .map((product: Product) => product._id);
      setSelectedProducts(currentNewArrivals);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleProductToggle = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSaveNewArrivals = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product/new-arrivals/bulk`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productIds: selectedProducts }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update new arrivals");
      }

      // Update local state
      setProducts((prev) =>
        prev.map((product) => ({
          ...product,
          isNewArrival: selectedProducts.includes(product._id),
        }))
      );

      alert("New arrivals updated successfully!");
    } catch (error) {
      console.error("Error updating new arrivals:", error);
      alert("Failed to update new arrivals");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading products...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage New Arrivals</h1>
          <p className="text-gray-600 mt-2">
            Select products to feature as new arrivals on the homepage
          </p>
        </div>
        <Button
          onClick={handleSaveNewArrivals}
          disabled={saving}
          className="bg-[#8B7355] hover:bg-[#7A6449]"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Selection Summary</CardTitle>
          <CardDescription>
            {selectedProducts.length} product
            {selectedProducts.length !== 1 ? "s" : ""} selected as new arrivals
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Products ({products.length})</CardTitle>
          <CardDescription>
            Check the products you want to feature as new arrivals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className={`border rounded-lg p-4 transition-all ${
                  selectedProducts.includes(product._id)
                    ? "border-[#8B7355] bg-[#8B7355]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={selectedProducts.includes(product._id)}
                    onCheckedChange={() => handleProductToggle(product._id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-start space-x-3">
                      <img
                        src={
                          getFullImageUrl(product.images?.[0]) ||
                          "/placeholder.svg"
                        }
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-md"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          e.currentTarget.src =
                            "/placeholder.svg?height=64&width=64";
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-sm mb-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2">
                          SKU: {product.sku}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            PKR {product.price}
                          </span>
                          <div className="flex space-x-1">
                            <Badge
                              variant={
                                product.isActive ? "default" : "secondary"
                              }
                              className={`text-xs ${
                                product.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {product.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {product.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
