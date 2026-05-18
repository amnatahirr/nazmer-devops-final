"use client";

import { X, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const { state, updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

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
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 z-40 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Cart Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[420px] bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b">
          <h2 className="text-lg font-medium font-ubuntu">
            Cart{" "}
            <span className="text-gray-500 text-sm">
              ({state.totalItems} {state.totalItems === 1 ? "item" : "items"})
            </span>
          </h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex flex-col h-[calc(100%-72px)] justify-between font-ubuntu font-light">
          {state.items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 mb-4">Your cart is empty</p>
                <button
                  onClick={() => {
                    router.push("/shop");
                    onClose();
                  }}
                  className="text-beige_dark hover:text-third underline"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto space-y-4">
                {state.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start space-x-4 relative"
                  >
                    <img
                      src={getFullImageUrl(item.image) || "/placeholder.svg"}
                      alt={item.name}
                      className="w-20 h-20 object-cover border rounded"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      {item.color && (
                        <p className="text-sm text-gray-500">
                          Color: {item.color}
                        </p>
                      )}
                      {item.size && (
                        <p className="text-sm text-gray-500">
                          Size: {item.size}
                        </p>
                      )}
                      <p className="text-sm mt-1">
                        PKR {item.price.toFixed(2)}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
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
                      className="text-gray-400 hover:text-beige_dark absolute top-0 right-0"
                      onClick={() => removeFromCart(item.id.toString())}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Total & Buttons */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Estimated total</span>
                  <span className="font-medium">
                    PKR {state.totalPrice.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Taxes and shipping are calculated at checkout.
                </p>

                {/* Buttons */}
                <button
                  className="w-full bg-beige_dark text-white py-2 rounded text-sm hover:opacity-90 transition duration-200"
                  onClick={() => {
                    router.push("/checkout");
                    onClose();
                  }}
                >
                  Checkout
                </button>
                <button
                  onClick={() => {
                    router.push("/cart");
                    onClose();
                  }}
                  className="w-full border border-beige_dark py-2 rounded text-sm text-beige_dark hover:opacity-80 transition duration-200"
                >
                  View Cart
                </button>

                <p className="text-xs text-center text-black mt-2 font-dark">
                  🔒 Secure Checkout
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
