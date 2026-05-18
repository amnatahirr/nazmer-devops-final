"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export default function StorePolicyContent() {
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
          Store Policy
        </h1>
        <p
          className={cn(
            "text-gray-600 font-ubuntu mb-12 transition-all duration-700 ease-out delay-100",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
        >
          Our commitment to transparency and fair practices.
        </p>

        <div className="max-w-4xl mx-auto text-left space-y-8">
          <div
            className={cn(
              "transition-all duration-700 ease-out delay-200",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            <h2 className="text-2xl font-medium text-gray-700 mb-4">Terms of Service</h2>
            <p className="text-gray-600 leading-relaxed">
              Welcome to NAZMER. By accessing or using our website, you agree to be bound by these Terms of Service.
              Please read them carefully. We reserve the right to update, change, or replace any part of these Terms of
              Service by posting updates and/or changes to our website. It is your responsibility to check this page
              periodically for changes. Your continued use of or access to the website following the posting of any
              changes constitutes acceptance of those changes.
            </p>
          </div>

          <div
            className={cn(
              "transition-all duration-700 ease-out delay-300",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            <h2 className="text-2xl font-medium text-gray-700 mb-4">Privacy Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              Your privacy is critically important to us. At NAZMER, we have a few fundamental principles:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>We don’t ask you for personal information unless we truly need it.</li>
                <li>
                  We don’t share your personal information with anyone except to comply with the law, develop our
                  products, or protect our rights.
                </li>
                <li>
                  We don’t store personal information on our servers unless required for the on-going operation of one
                  of our services.
                </li>
              </ul>
              This Privacy Policy describes how your personal information is collected, used, and shared when you visit
              or make a purchase from nazmer.com.
            </p>
          </div>

          <div
            className={cn(
              "transition-all duration-700 ease-out delay-400",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            <h2 className="text-2xl font-medium text-gray-700 mb-4">Refund Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              Our refund and returns policy lasts 30 days. If 30 days have passed since your purchase, we can’t offer
              you a full refund or exchange. To be eligible for a return, your item must be unused and in the same
              condition that you received it. It must also be in the original packaging. Several types of goods are
              exempt from being returned. Perishable goods such as food, flowers, newspapers or magazines cannot be
              returned. We also do not accept products that are intimate or sanitary goods, hazardous materials, or
              flammable liquids or gases.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
