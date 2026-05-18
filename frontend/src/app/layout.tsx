import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/contexts/CartContext'
import FloatingAppointmentButton from "@/components/floating-appointment-button"
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Nazmer – Modern Ethnic Wear",
  description: "Shop premium ethnic wear | Where Every Stitch Honors Your Story",
   icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Nazmer – Modern Ethnic Wear",
    description: "Shop premium ethnic wear | Where Every Stitch Honors Your Story | N A Z M E R",
    url: "https://www.nazmer.com",
    siteName: "Nazmer",
    images: [
      {
        url: "https://www.nazmer.com/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_PK",
    type: "website",
  },
}



export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
       <FloatingAppointmentButton />
    </html>
  )
}