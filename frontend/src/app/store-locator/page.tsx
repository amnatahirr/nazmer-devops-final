import Header from "@/components/header"
import Footer from "@/components/footer"
import StoreLocatorContent from "@/components/StoreLocatorContent"

export default function StoreLocatorPage() {
  return (
    <>
      <Header />
      <main className="flex-grow">
        <StoreLocatorContent />
      </main>
      <Footer />
    </>
  )
}
