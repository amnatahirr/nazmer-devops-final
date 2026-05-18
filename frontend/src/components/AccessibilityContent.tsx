"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Accessibility } from "lucide-react"

export default function AccessibilityContent() {
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
          Accessibility Statement
        </h1>
        <p
          className={cn(
            "text-gray-600 font-ubuntu mb-12 transition-all duration-700 ease-out delay-100",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
        >
          Ensuring our website is accessible to everyone.
        </p>

        <div className="max-w-4xl mx-auto text-left space-y-8">
          <div
            className={cn(
              "transition-all duration-700 ease-out delay-200",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            <h2 className="text-2xl font-medium text-gray-700 mb-4 flex items-center">
              <Accessibility className="h-6 w-6 mr-2 text-beige_dark" /> Our Commitment
            </h2>
            <p className="text-gray-600 leading-relaxed">
              NAZMER is committed to ensuring digital accessibility for people with disabilities. We are continually
              improving the user experience for everyone and applying the relevant accessibility standards. We believe
              that everyone should be able to access our website and its content, regardless of ability.
            </p>
          </div>

          <div
            className={cn(
              "transition-all duration-700 ease-out delay-300",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            <h2 className="text-2xl font-medium text-gray-700 mb-4">Measures to Support Accessibility</h2>
            <p className="text-gray-600 leading-relaxed">
              NAZMER takes the following measures to ensure accessibility of nazmer.com:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Include accessibility as a core part of our mission statement.</li>
                <li>Include accessibility in our internal policies.</li>
                <li>Provide continual accessibility training for our staff.</li>
                <li>Employ formal accessibility quality assurance methods.</li>
                <li>Use clear and consistent navigation throughout the site.</li>
                <li>Provide alternative text for all meaningful images.</li>
                <li>Ensure keyboard navigation is fully functional.</li>
                <li>Maintain sufficient color contrast for readability.</li>
              </ul>
            </p>
          </div>

          <div
            className={cn(
              "transition-all duration-700 ease-out delay-400",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            <h2 className="text-2xl font-medium text-gray-700 mb-4">Feedback</h2>
            <p className="text-gray-600 leading-relaxed">
              We welcome your feedback on the accessibility of NAZMER. Please let us know if you encounter accessibility
              barriers on nazmer.com:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>
                  E-mail:{" "}
                  <a href="mailto:accessibility@nazmer.com" className="text-beige_dark hover:underline">
                   nazmerbrand@gmail.com
                  </a>
                </li>
              </ul>
              We try to respond to feedback within 5 business days.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
