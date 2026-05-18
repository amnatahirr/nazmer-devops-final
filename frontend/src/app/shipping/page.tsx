import Header from "@/components/header"
import Footer from "@/components/footer"
import ShippingContent from "@/components/ShippingContent"

export default function ShippingPage() {
  return (
    <>
      <Header />
      <main className="flex-grow">
        <ShippingContent />
      </main>
      <Footer />
    </>
  )
}
