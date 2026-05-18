"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
  const router = useRouter();
  const { state, updateQuantity, removeFromCart } = useCart();

  // Helper function for image handling
  const getFullImageUrl = (imagePath: string) => {
    if (!imagePath) return "/placeholder.svg";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath.replace(/^http:\/\//, "https://");
    }
    const cleanPath = imagePath.startsWith("/")
      ? imagePath.slice(1)
      : imagePath;
    return `${process.env.NEXT_PUBLIC_API_URL}/${cleanPath}`; // This will work without import
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  if (state.items.length === 0) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-12 font-ubuntu font-light mb-8">
        <h1 className="text-xl font-light mb-6">My cart</h1>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <button
            onClick={() => router.push("/shop")}
            className="bg-beige_dark text-white px-6 py-2 rounded hover:bg-third transition"
          >
            Continue Shopping
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-12 font-ubuntu font-light mb-8">
      {/* Top Title */}
      <h1 className="text-xl font-light mb-6">My cart</h1>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {state.items.map((item) => (
            <div
              key={item.id}
              className="border rounded p-4 flex items-start space-x-4 relative"
            >
              <img
                src={getFullImageUrl(item.image) || "/placeholder.svg"}
                alt={item.name}
                className="w-24 h-24 object-cover border rounded"
                crossOrigin="anonymous"
              />
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  PKR {item.price.toFixed(2)}
                </p>
                {item.color && (
                  <p className="text-sm text-gray-500 mt-1">
                    Color: {item.color}
                  </p>
                )}
                {item.size && (
                  <p className="text-sm text-gray-500 mt-1">
                    Size: {item.size}
                  </p>
                )}
                <div className="flex items-center space-x-2 mt-3">
                  <button
                    className="w-6 h-6 border text-sm"
                    onClick={() =>
                      handleQuantityChange(
                        item.id.toString(),
                        item.quantity - 1
                      )
                    }
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm">
                    {item.quantity}
                  </span>
                  <button
                    className="w-6 h-6 border text-sm"
                    onClick={() =>
                      handleQuantityChange(
                        item.id.toString(),
                        item.quantity + 1
                      )
                    }
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                className="text-gray-400 hover:text-beige_dark absolute top-4 right-4"
                onClick={() => removeFromCart(item.id.toString())}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Right: Order Summary */}
        <div className="space-y-4 font-ubuntu font-light">
          <div className="border rounded p-6 space-y-4 h-fit">
            <h2 className="text-lg font-light mb-4">Order summary</h2>
            <div className="flex justify-between text-sm">
              <span>
                Subtotal ({state.totalItems}{" "}
                {state.totalItems === 1 ? "item" : "items"})
              </span>
              <span>PKR {state.totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-light text-lg border-t pt-2">
              <span>Total</span>
              <span>PKR {state.totalPrice.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-beige_dark text-white py-3 rounded text-sm hover:bg-third transition"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
