// components/Footer.tsx
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

export default function Footer() {
  return (
    <div>
      <footer className="bg-beige py-16 mt-auto">
        <div className="container mx-auto px-4 font-ubuntu font-light">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Customer Care */}
            <div>
              <h3 className="font-medium text-lg mb-4 text-gray-700">Customer Care</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/faq" className="text-gray-600 hover:text-black">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="text-gray-600 hover:text-black">
                    Shipping & Returns
                  </Link>
                </li>
                <li>
                  <Link href="/store-policy" className="text-gray-600 hover:text-black">
                    Store Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h3 className="font-medium text-lg mb-4 text-gray-700">Connect</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-black">
                    Instagram
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-black">
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-black">
                    Facebook
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-600 hover:text-black">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* The Company */}
            <div>
              <h3 className="font-medium text-lg mb-4 text-gray-700">The Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-600 hover:text-black">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/sustainability" className="text-gray-600 hover:text-black">
                    Sustainability
                  </Link>
                </li>
                <li>
                  <Link href="/accessibility" className="text-gray-600 hover:text-black">
                    Accessibility
                  </Link>
                </li>
                <li>
                  <Link href="/store-locator" className="text-gray-600 hover:text-black">
                    Store Locator
                  </Link>
                </li>
              </ul>
            </div>

            {/* Newsletter Signup */}
            <div>
              <h3 className="font-medium text-lg mb-4 text-gray-700">Sign up for special offers</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm text-gray-600 mb-2">
                    Enter your email here *
                  </label>
                  <Input id="email" type="email" className="w-full border-gray-300" placeholder="" />
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox id="newsletter" className="mt-1" />
                  <label htmlFor="newsletter" className="text-sm text-gray-600">
                    Yes, subscribe me to your newsletter. *
                  </label>
                </div>
                <Button className="w-full bg-beige_dark text-white hover:bg-third">Submit</Button>
              </div>
            </div>
          </div>
        </div>
      </footer>
      {/* Bottom Footer */}
      <div className="bg-third border-t border-gray-300 h-20 flex justify-center items-center">
        <div className="text-sm text-white text-center">© 2025 by NAZMER. Powered and secured by PixelPair</div>
      </div>
    </div>
  )
}
