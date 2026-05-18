"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Leaf, Recycle, HeartHandshake } from "lucide-react"

export default function SustainabilityContent() {
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
          Our Commitment to Sustainability
        </h1>
        <p
          className={cn(
            "text-gray-600 font-ubuntu mb-12 transition-all duration-700 ease-out delay-100",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
        >
          Building a better future, one conscious choice at a time.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div
            className={cn(
              "flex flex-col items-center p-6 bg-beige rounded-lg shadow-sm transition-all duration-700 ease-out delay-200",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            <Leaf className="h-12 w-12 text-beige_dark mb-4" />
            <h2 className="text-xl font-medium text-gray-700 mb-3">Ethical Sourcing</h2>
            <p className="text-gray-600 leading-relaxed">
              We partner with suppliers who share our values, ensuring fair labor practices and responsible material
              sourcing from farm to fabric.
            </p>
          </div>

          <div
            className={cn(
              "flex flex-col items-center p-6 bg-beige rounded-lg shadow-sm transition-all duration-700 ease-out delay-300",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            <Recycle className="h-12 w-12 text-beige_dark mb-4" />
            <h2 className="text-xl font-medium text-gray-700 mb-3">Environmental Impact</h2>
            <p className="text-gray-600 leading-relaxed">
              From reducing waste in production to using eco-friendly packaging, we are constantly working to minimize
              our ecological footprint.
            </p>
          </div>

          <div
            className={cn(
              "flex flex-col items-center p-6 bg-beige rounded-lg shadow-sm transition-all duration-700 ease-out delay-400",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            <HeartHandshake className="h-12 w-12 text-beige_dark mb-4" />
            <h2 className="text-xl font-medium text-gray-700 mb-3">Community Engagement</h2>
            <p className="text-gray-600 leading-relaxed">
              We believe in giving back. A portion of our profits supports initiatives that empower communities and
              promote sustainable development.
            </p>
          </div>
        </div>

        <div
          className={cn(
            "mt-16 max-w-4xl mx-auto text-left transition-all duration-700 ease-out delay-500",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
        >
          <h2 className="text-3xl font-medium text-gray-700 mb-6 text-center">Our Journey Towards a Greener Future</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            At NAZMER, sustainability isn't just a buzzword; it's a core principle embedded in every aspect of our
            business. We are dedicated to creating beautiful, high-quality products while ensuring a positive impact on
            our planet and its people. Our journey is continuous, and we are always seeking innovative ways to improve
            our practices.
          </p>
          <div className="w-full h-full bg-gray-200 rounded-lg overflow-hidden mb-6">
            <img
              src="/sustpic.jpeg"
              alt="Sustainable Production"
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          </div>
          <p className="text-gray-600 leading-relaxed">
            We invite you to learn more about our initiatives and join us in making a difference. Together, we can
            foster a more sustainable and equitable fashion industry.
          </p>
        </div>
      </div>
    </section>
  )
}
