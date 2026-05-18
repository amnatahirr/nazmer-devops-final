"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Mail, Phone, MapPin } from "lucide-react"

export default function ContactContent() {
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
          Get in Touch
        </h1>
        <p
          className={cn(
            "text-gray-600 font-ubuntu mb-12 transition-all duration-700 ease-out delay-100",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
        >
          We'd love to hear from you! Reach out to us for any inquiries or support.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto text-left">
          <div
            className={cn(
              "transition-all duration-700 ease-out delay-200",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            <h2 className="text-2xl font-medium text-gray-700 mb-4">Send Us a Message</h2>
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <Input id="name" type="text" placeholder="Your Name" className="w-full border-gray-300" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input id="email" type="email" placeholder="your@example.com" className="w-full border-gray-300" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <Textarea id="message" placeholder="Your message..." rows={5} className="w-full border-gray-300" />
              </div>
              <Button type="submit" className="w-full bg-beige_dark text-white hover:bg-third">
                Submit Message
              </Button>
            </form>
          </div>

          <div
            className={cn(
              "transition-all duration-700 ease-out delay-300",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            <h2 className="text-2xl font-medium text-gray-700 mb-4">Contact Information</h2>
            <div className="space-y-6 text-gray-600">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-beige_dark" />
                <span>nazmerbrand@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-beige_dark" />
                <span>+92 (323) 781-8164</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-beige_dark mt-1" />
                <span>
                  Nazmer by Nazia Amer,
                  <br />
                  Paragon city,
                  <br />
                  Lahore
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-medium text-gray-700 mt-8 mb-4">Our Location</h2>
            <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
              <iframe
                src="https://maps.google.com/maps?q=Paragon+City+Lahore+Pakistan&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Nazmer by Nazia Amer Location - Paragon City, Lahore"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
