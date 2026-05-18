"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export default function ShippingContent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="py-20 bg-white text-black">
      <div className="container mx-auto px-4 text-center">
        <h1
          className={cn(
            "text-4xl md:text-6xl font-light mb-8 tracking-wide font-ubuntu transition-all duration-700 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
        >
          Shipping & Returns
        </h1>
        <p
          className={cn(
            "text-gray-600 font-ubuntu mb-12 transition-all duration-700 ease-out delay-100",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
        >
          Everything you need to know about our delivery and return processes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div
            className={cn(
              "text-left transition-all duration-700 ease-out delay-200",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            <h2 className="text-2xl font-medium text-gray-700 mb-4">Shipping Information</h2>
            <p className="text-gray-600 mb-4">
              We strive to process and ship all orders as quickly as possible. Please review the following details
              regarding our shipping methods:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>
                <strong>Standard Shipping:</strong> Delivered within 5-7 business days. Free for orders over PKR 5000.
              </li>
              <li>
                <strong>Express Shipping:</strong> Delivered within 2-3 business days. Available for an additional fee.
              </li>
              <li>
                <strong>International Shipping:</strong> Delivery times vary by destination, typically 7-21 business
                days. Customs duties and taxes are the responsibility of the recipient.
              </li>
              <li>Orders are processed Monday through Friday, excluding public holidays.</li>
              <li>You will receive a tracking number via email once your order has shipped.</li>
            </ul>
          </div>

          <div
            className={cn(
              "text-left transition-all duration-700 ease-out delay-300",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            <h2 className="text-2xl font-medium text-gray-700 mb-4">Returns & Exchanges</h2>
            <p className="text-gray-600 mb-4">
              Your satisfaction is our priority. If you are not completely happy with your purchase, we offer a
              straightforward return policy:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>
                Items can be returned or exchanged within <strong>30 days</strong> of the purchase date.
              </li>
              <li>
                All returned items must be unworn, unwashed, and in their original condition with all tags attached.
              </li>
              <li>To initiate a return, please contact our customer care team with your order number.</li>
              <li>
                Refunds will be processed to the original payment method within 7-10 business days after we receive and
                inspect the returned items.
              </li>
              <li>Sale items are final sale and cannot be returned or exchanged.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
