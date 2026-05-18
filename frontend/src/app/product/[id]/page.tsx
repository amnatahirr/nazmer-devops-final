"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useCart } from "@/contexts/CartContext";

interface Product {
  _id: string; // Ensure _id is a string
  name: string;
  price: number;
  originalPrice?: number;
  sku: string;
  images: string[];
  sizes: string[];
  description: string;
  details: {
    material: string;
    care: string;
    fit: string;
    origin: string;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    productInfo: true,
    returnPolicy: false,
    shippingInfo: false,
  });
  const [selectedSize, setSelectedSize] = useState("");
  const [sizeError, setSizeError] = useState("");
  const { addToCart } = useCart();

  // Helper function to get full image URL
  const getFullImageUrl = (imagePath: string) => {
    if (!imagePath) return "/placeholder.svg";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
     return imagePath.replace(/^http:\/\//, "https://");
    }
    const cleanPath = imagePath.startsWith("/")
      ? imagePath.slice(1)
      : imagePath;
    return `${process.env.NEXT_PUBLIC_API_URL}/${cleanPath}`;
  };

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  const fetchProduct = async (id: string) => {
    try {
      // Corrected API endpoint to match your server.js (singular /api/product)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product/${id}`
      );
      const data = await response.json();

      if (response.ok) {
        setProduct(data);
      } else {
        console.error("Failed to fetch product:", data.message);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (change: number) => {
    setQuantity(Math.max(1, quantity + change));
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setSizeError("");
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSizeError("Please select a size");
      return;
    }

    setIsAdding(true);

    addToCart({
      id: product._id, // Pass _id directly as a string
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images[0],
      size: selectedSize || undefined,
      sku: product.sku,
      quantity: quantity,
    });

    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  const handleBuyNow = () => {
    if (!product) return;

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSizeError("Please select a size");
      return;
    }

    handleAddToCart();
    setTimeout(() => {
      router.push("/checkout");
    }, 500);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-beige_dark"></div>
            <p className="mt-4 text-gray-600">Loading product...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-light text-header mb-4 font-ubuntu">
              Product Not Found
            </h1>
            <Button
              onClick={() => router.push("/shop")}
              className="bg-beige_dark hover:bg-beige text-white"
            >
              Back to Shop
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Side - Product Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
                <img
                  src={
                    getFullImageUrl(product.images[currentImageIndex]) ||
                    "/placeholder.svg"
                  }
                  alt={product.name}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              </div>

              {/* Thumbnail Images */}
              {product.images.length > 1 && (
                <div className="flex space-x-4">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        index === currentImageIndex
                          ? "border-beige_dark"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={getFullImageUrl(image) || "/placeholder.svg"}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous" // Add crossOrigin to thumbnail images
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Product Description */}
              <div className="pt-8">
                <p className="text-gray-600 leading-relaxed font-ubuntu">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Right Side - Product Details */}
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-light text-header mb-4 font-ubuntu">
                  {product.name}
                </h1>

                <p className="text-sm text-gray-600 mb-6">SKU: {product.sku}</p>

                {/* Price */}
                <div className="flex items-center space-x-3 mb-8">
                  {product.originalPrice &&
                  product.price < product.originalPrice ? (
                    <>
                      <span className="text-xl text-gray-400 line-through">
                        PKR {product.originalPrice.toFixed(2)}
                      </span>
                      <span className="text-2xl font-medium text-beige_dark">
                        PKR {product.price.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-medium text-beige_dark">
                      PKR {product.price.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Size Selection */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Size *
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => handleSizeSelect(size)}
                          className={`px-6 py-3 border rounded text-sm font-medium transition-colors ${
                            selectedSize === size
                              ? "border-beige_dark bg-beige_dark text-white"
                              : "border-gray-300 text-gray-700 hover:border-beige_dark hover:bg-gray-50"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    {sizeError && (
                      <p className="text-red-500 text-sm mt-2">{sizeError}</p>
                    )}
                  </div>
                )}

                {/* Quantity */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Quantity *
                  </label>
                  <div className="flex items-center border border-gray-300 rounded w-fit">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="p-3 hover:bg-gray-50"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-6 py-3 min-w-[80px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="p-3 hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 mb-12">
                  <Button
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className="w-full bg-white border border-beige_dark text-beige_dark hover:bg-third hover:text-white py-4 text-base font-ubuntu transition-colors"
                  >
                    {isAdding ? "Adding..." : "Add to Cart"}
                  </Button>

                  <Button
                    onClick={handleBuyNow}
                    className="w-full bg-beige_dark hover:bg-third/90 text-white py-4 text-base font-ubuntu"
                  >
                    Buy Now
                  </Button>
                </div>
              </div>

              {/* Expandable Sections */}
              <div className="space-y-4">
                {/* Product Info */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => toggleSection("productInfo")}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <span className="text-lg font-medium text-header font-ubuntu">
                      Product Info
                    </span>
                    {expandedSections.productInfo ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  {expandedSections.productInfo && (
                    <div className="pb-4 text-gray-600 font-ubuntu">
                      <div className="space-y-2">
                        <p>
                          <strong>Material:</strong> {product.details.material}
                        </p>
                        <p>
                          <strong>Care:</strong> {product.details.care}
                        </p>
                        <p>
                          <strong>Fit:</strong> {product.details.fit}
                        </p>
                        <p>
                          <strong>Origin:</strong> {product.details.origin}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Return & Refund Policy */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => toggleSection("returnPolicy")}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <span className="text-lg font-medium text-header font-ubuntu">
                      Return & Refund Policy
                    </span>
                    {expandedSections.returnPolicy ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  {expandedSections.returnPolicy && (
                    <div className="pb-4 text-gray-600 font-ubuntu">
                      <p>
                        We offer a 30-day return policy for all unworn items in
                        original condition. Items must be returned with original
                        tags and packaging. Refunds will be processed within 5-7
                        business days after we receive your return.
                      </p>
                    </div>
                  )}
                </div>

                {/* Shipping Info */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => toggleSection("shippingInfo")}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <span className="text-lg font-medium text-header font-ubuntu">
                      Shipping Info
                    </span>
                    {expandedSections.shippingInfo ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  {expandedSections.shippingInfo && (
                    <div className="pb-4 text-gray-600 font-ubuntu">
                      <p className="mb-2">
                        <strong>Free shipping</strong> on orders over $75
                      </p>
                      <p className="mb-2">
                        Standard delivery: 3-5 business days
                      </p>
                      <p>
                        Express delivery: 1-2 business days (additional charges
                        apply)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
