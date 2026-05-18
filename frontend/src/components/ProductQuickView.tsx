// components/ProductQuickView.tsx
"use client";

import { useState } from "react";
import { X, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

interface ProductQuickViewProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string; // Changed from number to string to match MongoDB _id
    name: string;
    price: number;
    originalPrice?: number;
    sku: string;
    image: string;
    images?: string[];
    sizes?: string[];
  };
}

export default function ProductQuickView({
  isOpen,
  onClose,
  product,
}: ProductQuickViewProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [sizeError, setSizeError] = useState("");
  const router = useRouter();
  const { addToCart } = useCart();

  const images = product.images || [product.image];

  const handleQuantityChange = (change: number) => {
    setQuantity(Math.max(1, quantity + change));
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setSizeError("");
  };

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSizeError("Please select a size");
      return;
    }

    setIsAdding(true);

    addToCart({
      id: product.id, // Now correctly passes the string _id
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      sku: product.sku,
      size: selectedSize || undefined,
      quantity: quantity,
    });

    setTimeout(() => {
      setIsAdding(false);
      onClose();
    }, 500);
  };

  const handleViewDetails = () => {
    router.push(`/product/${product.id}`); // Now correctly passes the string _id to the dynamic route
    onClose();
  };

  if (!isOpen) return null;

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

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 h-full">
            {/* Left Side - Product Images */}
            <div className="relative bg-gray-50">
              <img
                src={
                  getFullImageUrl(images[currentImageIndex]) ||
                  "/placeholder.svg"
                }
                alt={product.name}
                className="w-full h-full object-cover"
                crossOrigin="anonymous" // Add this line
              />

              {/* Image Navigation Dots */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Side - Product Details */}
            <div className="p-8 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-light text-header mb-4 font-ubuntu">
                  {product.name}
                </h2>

                {/* Price */}
                <div className="flex items-center space-x-3 mb-4">
                  {product.originalPrice &&
                  product.price < product.originalPrice ? (
                    <>
                      <span className="text-lg text-gray-400 line-through">
                        PKR {product.originalPrice.toFixed(2)}
                      </span>
                      <span className="text-xl font-medium text-beige_dark">
                        PKR {product.price.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-xl font-medium text-beige_dark">
                      PKR {product.price.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* SKU */}
                <p className="text-sm text-gray-600 mb-6">SKU: {product.sku}</p>

                {/* Size Selection */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Size *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => handleSizeSelect(size)}
                          className={`px-4 py-2 border rounded text-sm font-medium transition-colors ${
                            selectedSize === size
                              ? "border-beige_dark bg-beige_dark text-white"
                              : "border-gray-300 text-gray-700 hover:border-beige_dark"
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
                      className="p-2 hover:bg-gray-50"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 min-w-[50px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="p-2 hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="w-full bg-beige_dark hover:bg-third text-white py-3 text-base font-ubuntu"
                >
                  {isAdding ? "Adding..." : "Add to Cart"}
                </Button>

                <button
                  onClick={handleViewDetails}
                  className="w-full text-beige_dark hover:text-beige_dark underline text-sm font-ubuntu transition-opacity duration-300 hover:opacity-60"
                >
                  View More Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
