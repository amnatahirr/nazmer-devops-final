'use client';
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface OrderDetail {
  _id: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    size?: string;
    image?: string;
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    city: string;
    postal?: string;
    address: string;
    phone: string;
  };
  paymentMethod: string;
  billingAddressSameAsShipping: boolean;
  subtotal: number;
  shippingCost: number;
  grandTotal: number;
  status: string;
  createdAt: string;
}

export default function OrderConfirmation() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams?.get("orderId");
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails(orderId);
        } else {
            setError("No order ID found in URL.");
            setLoading(false);
        }
    }, [orderId]);

    const fetchOrderDetails = async (id: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}`);
            const data = await response.json();

            if (response.ok) {
                setOrder(data);
            } else {
                setError(data.message || "Failed to fetch order details.");
            }
        } catch (err) {
            console.error("Error fetching order details:", err);
            setError("Network error or server is unreachable.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-beige_dark"></div>
                    <p className="mt-4 text-gray-600">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-12 text-center max-w-md">
                    <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
                    <p className="text-gray-700 mb-6">{error}</p>
                    <button
                        onClick={() => router.push("/")}
                        className="mt-4 px-6 py-2 bg-beige_dark text-white rounded-full hover:bg-third transition-all"
                    >
                        Back to Shop
                    </button>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-12 text-center max-w-md">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Order Not Found</h1>
                    <p className="text-gray-600 mb-6">The order you are looking for could not be found.</p>
                    <button
                        onClick={() => router.push("/")}
                        className="mt-4 px-6 py-2 bg-beige_dark text-white rounded-full hover:bg-third transition-all"
                    >
                        Back to Shop
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-lg p-12 text-center max-w-md animate-scaleUp">
                <div className="text-beige_dark mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Successful!</h1>
                <p className="text-gray-600 mb-6">Thank you, {order.shippingAddress.firstName}! Your order has been placed successfully. 🎉</p>
                
                <div className="bg-gray-50 p-4 rounded-lg text-left mb-6 space-y-1">
                    <p className="font-semibold text-gray-700">Order ID: {order._id}</p>
                    <p className="font-semibold text-gray-700 mt-2">Shipping Details:</p>
                    <p>Name: {order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                    <p>Email: {order.shippingAddress.email}</p>
                    <p>Phone: {order.shippingAddress.phone}</p>
                    <p>Address: {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postal}</p>
                    <p className="font-semibold text-gray-700 mt-2">Payment Method: {order.paymentMethod === "cod" ? "Cash on Delivery" : "Card"}</p>
                    <p className="font-semibold text-gray-700 mt-2">Order Status: {order.status}</p>
                    <p className="font-semibold text-gray-700 mt-2">Total: PKR {order.grandTotal.toFixed(2)}</p>
                </div>

                <button
                    onClick={() => router.push("/")}
                    className="mt-4 px-6 py-2 bg-beige_dark text-white rounded-full hover:bg-third transition-all"
                >
                    Back to Shop
                </button>
            </div>
        </div>
    );
}
