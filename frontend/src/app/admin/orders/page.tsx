"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Eye, ChevronDown, ChevronRight, Package, User, MapPin, CreditCard, Download, Mail, Trash2 } from "lucide-react"

interface OrderItem {
  name: string
  quantity: number
  price: number
  originalPrice?: number
  image?: string
  size?: string
  sku?: string
}

interface Order {
  _id: string
  orderNumber: string
  userId?: {
    firstName: string
    lastName: string
    email: string
  }
  items: OrderItem[]
  shippingAddress: {
    firstName: string
    lastName: string
    fullName?: string
    email: string
    phone: string
    address: string
    city: string
    postal?: string
  }
  paymentMethod: string
  subtotal: number
  shippingCost: number
  grandTotal: number
  totalAmount: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  createdAt: string
}

const orderStatuses = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"]
const paymentStatuses = ["pending", "paid", "failed", "refunded"]

// Helper function to get full image URL
const getFullImageUrl = (imagePath: string) => {
  if (!imagePath) return "/placeholder.svg?height=50&width=50"

  // If it's already a full URL, return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath.replace(/^http:\/\//, "https://");
  }

  // Clean the path and construct full URL
  const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath
  const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}/${cleanPath}`

  return fullUrl
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login?redirect=/admin/orders")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()

      if (response.ok) {
        setOrders(data)
      } else {
        setError(data.message || "Failed to fetch orders.")
      }
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError("Network error or server is unreachable.")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string, type: "order" | "payment") => {
    if (!confirm(`Are you sure you want to change the ${type} status for order ${orderId} to ${newStatus}?`)) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [type === "order" ? "status" : "paymentStatus"]: newStatus }),
      })

      if (response.ok) {
        alert(`${type === "order" ? "Order" : "Payment"} status updated successfully!`)
        fetchOrders() // Re-fetch orders to update the list
      } else {
        const data = await response.json()
        alert(data.message || `Failed to update ${type} status.`)
      }
    } catch (err) {
      console.error(`Error updating ${type} status:`, err)
      alert("Network error or server is unreachable.")
    }
  }

  const handleSendOrderEmail = async (orderId: string, customerEmail: string) => {
    if (!confirm(`Send order confirmation email to ${customerEmail}?`)) {
      return
    }

    setActionLoading(orderId)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        alert("Order confirmation email sent successfully!")
      } else {
        const data = await response.json()
        alert(data.message || "Failed to send email.")
      }
    } catch (err) {
      console.error("Error sending email:", err)
      alert("Network error or server is unreachable.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDownloadInvoice = async (orderId: string) => {
    setActionLoading(orderId)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/invoice`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `invoice-${orderId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert("Failed to download invoice.")
      }
    } catch (err) {
      console.error("Error downloading invoice:", err)
      alert("Network error or server is unreachable.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      return
    }

    setActionLoading(orderId)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        alert("Order deleted successfully!")
        fetchOrders() // Re-fetch orders to update the list
      } else {
        const data = await response.json()
        alert(data.message || "Failed to delete order.")
      }
    } catch (err) {
      console.error("Error deleting order:", err)
      alert("Network error or server is unreachable.")
    } finally {
      setActionLoading(null)
    }
  }

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders)
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId)
    } else {
      newExpanded.add(orderId)
    }
    setExpandedOrders(newExpanded)
  }

  const getStatusBadgeColor = (status: string, type: "order" | "payment") => {
    if (type === "order") {
      switch (status) {
        case "pending":
          return "bg-yellow-100 text-yellow-800"
        case "processing":
          return "bg-blue-100 text-blue-800"
        case "shipped":
          return "bg-purple-100 text-purple-800"
        case "delivered":
          return "bg-green-100 text-green-800"
        case "cancelled":
          return "bg-red-100 text-red-800"
        case "refunded":
          return "bg-gray-100 text-gray-800"
        default:
          return "bg-gray-100 text-gray-800"
      }
    } else {
      switch (status) {
        case "pending":
          return "bg-yellow-100 text-yellow-800"
        case "paid":
          return "bg-green-100 text-green-800"
        case "failed":
          return "bg-red-100 text-red-800"
        case "refunded":
          return "bg-gray-100 text-gray-800"
        default:
          return "bg-gray-100 text-gray-800"
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-beige_dark"></div>
        <p className="ml-4 text-gray-600">Loading orders...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-600">
        <p>{error}</p>
        <Button onClick={fetchOrders} className="mt-4 bg-beige_dark text-white hover:bg-third">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-light text-gray-900">Order Management</h1>

      {orders.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg shadow-sm">
          <p className="text-gray-600">No orders found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <>
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleOrderExpansion(order._id)}
                            className="mr-2 p-1 h-8 w-8"
                          >
                            {expandedOrders.has(order._id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.orderNumber || `${order._id.substring(0, 8)}...`}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {order.userId
                                ? `${order.userId.firstName} ${order.userId.lastName}`
                                : `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`}
                              {!order.userId && <span className="text-xs text-gray-500 ml-1">(Guest)</span>}
                            </div>
                            <div className="text-xs text-gray-400">
                              {order.userId ? order.userId.email : order.shippingAddress.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        PKR {order.grandTotal.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value, "order")}
                          className={`block w-full py-1 px-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-beige_dark focus:border-beige_dark text-xs ${getStatusBadgeColor(order.status, "order")}`}
                        >
                          {orderStatuses.map((status) => (
                            <option key={status} value={status} className="capitalize">
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.paymentStatus}
                          onChange={(e) => handleStatusChange(order._id, e.target.value, "payment")}
                          className={`block w-full py-1 px-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-beige_dark focus:border-beige_dark text-xs ${getStatusBadgeColor(order.paymentStatus, "payment")}`}
                        >
                          {paymentStatuses.map((status) => (
                            <option key={status} value={status} className="capitalize">
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          

                          {/* Send Email */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleSendOrderEmail(
                                order._id,
                                order.userId ? order.userId.email : order.shippingAddress.email,
                              )
                            }
                            className="text-green-600 hover:bg-green-50"
                            title="Send Order Confirmation Email"
                            disabled={actionLoading === order._id}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>

                          {/* Download Invoice */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownloadInvoice(order._id)}
                            className="text-purple-600 hover:bg-purple-50"
                            title="Download Invoice"
                            disabled={actionLoading === order._id}
                          >
                            <Download className="h-4 w-4" />
                          </Button>

                          {/* Delete Order */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteOrder(order._id)}
                            className="text-red-600 hover:bg-red-50"
                            title="Delete Order"
                            disabled={actionLoading === order._id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Order Details Row */}
                    {expandedOrders.has(order._id) && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-gray-50">
                          <div className="space-y-6">
                            {/* Order Items */}
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                                <Package className="h-4 w-4 mr-2" />
                                Order Items ({order.items.length})
                              </h4>
                              <div className="grid gap-3">
                                {order.items.map((item, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center space-x-4 bg-white p-3 rounded-lg border"
                                  >
                                    <div className="flex-shrink-0">
                                      <img
                                        src={getFullImageUrl(item.image) || "/placeholder.svg"}
                                        alt={item.name}
                                        className="h-12 w-12 object-cover rounded-md border"
                                        crossOrigin="anonymous"
                                        onError={(e) => {
                                          console.error("Order item image failed to load:", item.image)
                                          e.currentTarget.src = "/placeholder.svg?height=50&width=50"
                                        }}
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                                        {item.size && <span>Size: {item.size}</span>}
                                        {item.sku && <span>SKU: {item.sku}</span>}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-medium text-gray-900">
                                        {item.quantity} × PKR {item.price.toFixed(2)}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        Total: PKR {(item.quantity * item.price).toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Order Summary */}
                            <div className="grid md:grid-cols-2 gap-6">
                              {/* Shipping Address */}
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                                  <MapPin className="h-4 w-4 mr-2" />
                                  Shipping Address
                                </h4>
                                <div className="bg-white p-3 rounded-lg border text-sm text-gray-600">
                                  <p className="font-medium text-gray-900">
                                    {order.shippingAddress.fullName ||
                                      `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`}
                                  </p>
                                  <p>{order.shippingAddress.email}</p>
                                  <p>{order.shippingAddress.phone}</p>
                                  <p>{order.shippingAddress.address}</p>
                                  <p>
                                    {order.shippingAddress.city} {order.shippingAddress.postal}
                                  </p>
                                </div>
                              </div>

                              {/* Payment & Order Summary */}
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Payment & Summary
                                </h4>
                                <div className="bg-white p-3 rounded-lg border text-sm">
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Payment Method:</span>
                                      <span className="font-medium capitalize">{order.paymentMethod}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Subtotal:</span>
                                      <span>PKR {order.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Shipping:</span>
                                      <span>PKR {order.shippingCost.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t pt-2 flex justify-between font-medium">
                                      <span>Grand Total:</span>
                                      <span>PKR {order.grandTotal.toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
