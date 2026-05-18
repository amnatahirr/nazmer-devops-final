"use client"
import { Button } from "@/components/ui/button"
import { Calendar, MessageCircle } from "lucide-react"
import { motion } from "framer-motion"

export default function FloatingAppointmentButton() {
  const handleBookAppointment = () => {
    try {
      // Format the phone number for WhatsApp (remove dashes and add country code)
      const phoneNumber = "923237818164" // Pakistan country code +92
      const message = "Hi! I would like to book an appointment for custom tailoring."
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

      // Try to open WhatsApp in a new tab
      const newWindow = window.open(whatsappUrl, "_blank", "noopener,noreferrer")

      // Check if popup was blocked
      if (!newWindow || newWindow.closed || typeof newWindow.closed == "undefined") {
        // Fallback: redirect in same window
        window.location.href = whatsappUrl
      } else {
        console.log("WhatsApp opened successfully")
      }
    } catch (error) {
      console.error("Error opening WhatsApp:", error)
      // Ultimate fallback - copy number to clipboard and alert user
      navigator.clipboard
        .writeText("0323-7818164")
        .then(() => {
          alert("WhatsApp couldn't open. Phone number (0323-7818164) copied to clipboard!")
        })
        .catch(() => {
          alert("Please contact us at: 0323-7818164")
        })
    }
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, duration: 0.5, ease: "easeOut" }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Button
        onClick={handleBookAppointment}
        className="bg-beige_dark hover:bg-third text-white px-6 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 text-base font-medium group cursor-pointer"
        size="lg"
        type="button"
      >
        <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
        <span className="hidden sm:inline">Book an Appointment</span>
        <span className="sm:hidden">Book Now</span>
        <Calendar className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
      </Button>

      {/* Pulse animation ring */}
      <div className="absolute inset-0 rounded-full bg-beige_dark opacity-20 animate-ping pointer-events-none"></div>
    </motion.div>
  )
}
