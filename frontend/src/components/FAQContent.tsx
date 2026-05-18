"use client"

import { useEffect, useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

const faqs = [
  {
    question: "What is your shipping policy?",
    answer:
      "We offer various shipping options, including standard and express delivery. Shipping times and costs vary depending on your location and the selected method. You can find detailed information on our Shipping & Returns page.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Once your order is shipped, you will receive a confirmation email with a tracking number. You can use this number on the carrier's website to monitor your package's journey.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We accept returns within 30 days of purchase, provided the items are in their original condition with tags attached. Please visit our Shipping & Returns page for a complete guide on how to initiate a return.",
  },
  {
    question: "Do you offer international shipping?",
    answer:
      "Yes, we do! International shipping options are available at checkout. Please note that customs duties and taxes may apply, which are the responsibility of the customer.",
  },
  {
    question: "How do I choose the right size?",
    answer:
      "We provide a detailed size guide on each product page to help you find the perfect fit. If you're still unsure, feel free to contact our customer care team for personalized assistance.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept major credit cards (Visa, MasterCard, American Express), PayPal, and other local payment options as available at checkout.",
  },
]

export default function FAQContent() {
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
          Frequently Asked Questions
        </h1>
        <p
          className={cn(
            "text-gray-600 font-ubuntu mb-12 transition-all duration-700 ease-out delay-100",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
        >
          Find answers to common questions about our products, orders, and policies.
        </p>

        <div
          className={cn(
            "max-w-3xl mx-auto transition-all duration-700 ease-out delay-200",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="font-medium text-lg text-gray-700 hover:no-underline hover:text-beige_dark transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 text-left py-4">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
