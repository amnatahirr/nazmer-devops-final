"use client"
import { useState, type ChangeEvent, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/CartContext" // Import useCart

interface CheckoutFormData {
  email: string
  city: string
  postal: string
  firstName: string
  lastName: string
  address: string
  phone: string
  payment: string
  billing: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { state: cartState, clearCart } = useCart() // Get clearCart from context
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: "",
    city: "",
    postal: "",
    firstName: "",
    lastName: "",
    address: "",
    phone: "",
    payment: "cod",
    billing: "same",
  })

  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({})
  const [isLoading, setIsLoading] = useState(false)

  const cities = [
    "Karachi",
    "Lahore",
    "Islamabad",
    "Rawalpindi",
    "Faisalabad",
    "Multan",
    "Peshawar",
    "Quetta",
    "Sialkot",
    "Gujranwala",
    "Bahawalpur",
    "Sukkur",
    "Abbottabad",
    "Hyderabad",
    "Larkana",
    "Mardan",
    "Sheikhupura",
    "Okara",
    "Rahim Yar Khan",
    "Sargodha",
    "Gujrat",
  ]

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const newErrors: Partial<CheckoutFormData> = {}

    // Validation
    if (!formData.email) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email"
    if (!formData.city) newErrors.city = "City is required"
    if (!formData.firstName) newErrors.firstName = "First Name is required"
    if (!formData.lastName) newErrors.lastName = "Last Name is required"
    if (!formData.address) newErrors.address = "Address is required"
    if (!formData.phone) newErrors.phone = "Phone is required"
    else if (!/^[0-9]{11}$/.test(formData.phone)) newErrors.phone = "Phone must be 11 digits"

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      if (cartState.items.length === 0) {
   
        setIsLoading(false)
        return
      }

      // Fixed: Match the backend Order model structure exactly
      const orderData = {
        items: cartState.items.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          originalPrice: item.originalPrice,
          quantity: item.quantity,
          image: item.image,
          size: item.size,
          sku: item.sku,
        })),
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          fullName: `${formData.firstName} ${formData.lastName}`, // Add fullName field
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postal: formData.postal,
        },
        paymentMethod: formData.payment,
        billingAddressSameAsShipping: formData.billing === "same",
        subtotal: cartState.totalPrice,
        shippingCost: shippingCost,
        grandTotal: grandTotal,
        totalAmount: cartState.totalPrice, // Add this field as backend expects it
      }

      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(orderData),
        })

        const data = await response.json()

        if (response.ok) {
      
          clearCart()
          router.push(`/order-confirmation?orderId=${data.orderId}`)
        } else {
          console.error("Order creation failed:", data)
          if (data.errors) {
            const apiErrors: Partial<CheckoutFormData> = {}
            data.errors.forEach((error: any) => {
              if (error.path) {
                apiErrors[error.path as keyof CheckoutFormData] = error.msg
              }
            })
            setErrors(apiErrors)
         
          } else {
            alert(data.message || "Order failed. Please try again.")
          }
        }
      } catch (error) {
        console.error("Order submission error:", error)
        alert("Network error. Please check your connection and try again.")
      }
    }
    setIsLoading(false)
  }

  // Calculate shipping cost (example logic)
 const shippingCost = formData.city
  ? formData.city === "Lahore"
    ? 200
    : 500
  : null 
const grandTotal = shippingCost !== null
  ? cartState.totalPrice + shippingCost
  : cartState.totalPrice

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* LEFT SIDE: FORM */}
        <form onSubmit={handleSubmit} className="md:col-span-2 bg-white p-8 rounded shadow-lg space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>

          {/* Contact Info */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-beige focus:border-beige ${errors.email ? "border-red-500" : ""}`}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          {/* Delivery Info */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Delivery Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`border p-2 w-full rounded focus:outline-none focus:ring-1 focus:ring-beige focus:border-beige ${errors.city ? "border-red-500" : ""}`}
                >
                  <option value="">Select your city</option>
                  {cities.map((city, i) => (
                    <option key={i} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  name="postal"
                  value={formData.postal}
                  onChange={handleChange}
                  placeholder="Optional"
                  className="border p-2 w-full rounded focus:outline-none focus:ring-1 focus:ring-beige focus:border-beige"
                />
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {["firstName", "lastName", "address", "phone"].map((field, i) => {
                const labelMap: Record<string, string> = {
                  firstName: "First Name",
                  lastName: "Last Name",
                  address: "Address",
                  phone: "Phone",
                }
                const placeholderMap: Record<string, string> = {
                  firstName: "John",
                  lastName: "Doe",
                  address: "123 Main Street",
                  phone: "03001234567",
                }
                return (
                  <div key={i}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{labelMap[field]}</label>
                    <input
                      type={field === "phone" ? "tel" : "text"}
                      name={field}
                      value={formData[field as keyof CheckoutFormData]}
                      onChange={handleChange}
                      placeholder={placeholderMap[field]}
                      className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-beige focus:border-beige ${errors[field as keyof CheckoutFormData] ? "border-red-500" : ""}`}
                    />
                    {errors[field as keyof CheckoutFormData] && (
                      <p className="text-red-500 text-sm">{errors[field as keyof CheckoutFormData]}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Payment */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment</h2>
            <div className="space-y-2">
              {[
                { label: "Cash on Delivery (COD)", value: "cod" },
                { label: "Debit - Credit Card", value: "card" },
              ].map((method, idx) => (
                <label
                  key={idx}
                  className={`flex items-center border p-3 rounded cursor-pointer transition-all
                    hover:border-beige_dark
                    ${formData.payment === method.value ? "border-beige_dark bg-beige_dark/10" : "border-gray-300"}
                  `}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.value}
                    checked={formData.payment === method.value}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span className="ml-2 text-gray-800">{method.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Billing Address */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Billing Address</h2>
            <div className="space-y-2">
              {[
                { label: "Same as shipping address", value: "same" },
                { label: "Use a different billing address", value: "different" },
              ].map((option, i) => (
                <label
                  key={i}
                  className={`flex items-center border p-3 rounded cursor-pointer hover:border-beige_dark
                    ${formData.billing === option.value ? "border-beige_dark bg-beige_dark/10" : "border-gray-300"}
                    ${errors.billing ? "border-red-500" : ""}
                  `}
                >
                  <input
                    type="radio"
                    name="billing"
                    value={option.value}
                    checked={formData.billing === option.value}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span className="ml-2 text-gray-800">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm rounded p-4">
  <p className="font-semibold">Important Notice:</p>
  <p>
    Since we create <span className="font-medium">customized orders</span>, a
    <span className="font-medium"> 50% advance payment</span> is required to confirm your order.
    Our team will contact you on <span className="font-medium">WhatsApp</span> after checkout to share
    the payment details and process.
  </p>
</div>


          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-beige_dark text-white py-3 rounded hover:bg-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing Order..." : "Complete Order"}
          </button>
        </form>

        {/* RIGHT SIDE: ORDER SUMMARY */}
        <div className="bg-white border rounded shadow-sm p-6 space-y-4 h-fit">
          <h3 className="text-xl font-semibold text-gray-800">Order Summary</h3>

          <div className="divide-y text-sm text-gray-700">
            {cartState.items.length === 0 ? (
              <p className="py-2 text-gray-500">Your cart is empty.</p>
            ) : (
              cartState.items.map((item) => (
                <div key={item.id} className="py-2 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded mt-1"
                      crossOrigin="anonymous" // Ensure images load
                    />
                    <span>
                      {item.name} ({item.size || "N/A"}) x {item.quantity}
                    </span>
                  </div>
                  <span>PKR {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>

          <div className="border-t pt-4 space-y-1 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>
                Subtotal ({cartState.totalItems} {cartState.totalItems === 1 ? "item" : "items"})
              </span>
              <span>PKR {cartState.totalPrice.toFixed(2)}</span>
            </div>
          <div className="flex justify-between">
  <span>Shipping</span>
  <span>
    {shippingCost === null ? "Depends on city" : `PKR ${shippingCost.toFixed(2)}`}
  </span>
</div>

          <div className="flex justify-between font-bold text-gray-900">
  <span>Total (PKR)</span>
  <span>
    {shippingCost === null
      ? "Select city to see total"
      : `PKR ${grandTotal.toFixed(2)}`}
  </span>
</div>

          </div>
        </div>
      </div>
    </div>
  )
}
