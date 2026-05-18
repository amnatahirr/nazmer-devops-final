import Header from "@/components/header"
import Footer from "@/components/footer"
import SustainabilityContent from "@/components/SustainabilityContent"

export default function SustainabilityPage() {
  return (
    <>
      <Header />
      <main className="flex-grow">
        <SustainabilityContent />
      </main>
      <Footer />
    </>
  )
}
