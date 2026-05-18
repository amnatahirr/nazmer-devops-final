"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MapPin, Search } from "lucide-react"

interface Store {
  id: number
  name: string
  address: string
  city: string
  hours: string
}

const stores: Store[] = [
  {
    id: 1,
    name: "NAZMER by Nazia Amer",
    address: "Paragon",
    city: "Lahore",
    hours: "Mon-Sat: 12 PM - 10 PM, Sun: 11 AM - 10 PM",
  }
]

export default function StoreLocatorContent() {
  const [isVisible, setIsVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredStores, setFilteredStores] = useState<Store[]>(stores)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    setFilteredStores(
      stores.filter(
        (store) =>
          store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          store.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          store.city.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    )
  }, [searchTerm])

  return (
    <section className="py-20 bg-white text-black">
      <div className="container mx-auto px-4 text-center">
        <h1
          className={cn(
            "text-4xl md:text-6xl font-light mb-8 tracking-wide font-ubuntu transition-all duration-700 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
        >
          Store Locator
        </h1>
        <p
          className={cn(
            "text-gray-600 font-ubuntu mb-12 transition-all duration-700 ease-out delay-100",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
        >
          Find a NAZMER store near you.
        </p>

        <div
          className={cn(
            "max-w-3xl mx-auto mb-12 transition-all duration-700 ease-out delay-200",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
        >
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Search by city, address, or store name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border-gray-300"
            />
            <Button className="bg-beige_dark text-white hover:bg-third">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto text-left">
          {filteredStores.length > 0 ? (
            filteredStores.map((store, index) => (
              <div
                key={store.id}
                className={cn(
                  "p-6 bg-beige rounded-lg shadow-sm transition-all duration-700 ease-out",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                  `delay-${200 + index * 100}`, // Staggered animation
                )}
              >
                <h2 className="text-xl font-medium text-gray-700 mb-2">{store.name}</h2>
                <p className="text-gray-600 flex items-center mb-1">
                  <MapPin className="h-4 w-4 mr-2 text-beige_dark" />
                  {store.address}, {store.city}
                </p>
                <p className="text-gray-600 text-sm">Hours: {store.hours}</p>
              </div>
            ))
          ) : (
            <div className="md:col-span-2 text-center text-gray-600 text-lg">No stores found matching your search.</div>
          )}
        </div>
 {/* Placeholder for store locator content */}
      <div className="mt-16 w-full h-96 bg-gray-200 rounded-lg overflow-hidden max-w-5xl mx-auto transition-all duration-700 ease-out delay-500">
        <iframe
          src="https://maps.google.com/maps?q=Paragon+City+Lahore+Pakistan&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="NAZMER Store Location - Paragon City, Lahore"
        />
      </div>
      </div>
    </section>
  )
}
