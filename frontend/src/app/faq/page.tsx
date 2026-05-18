import Header from "@/components/header"
import Footer from "@/components/footer"
import FAQContent from "@/components/FAQContent"

export default function FAQPage() {
  return (
    <>
      <Header />
      <main className="flex-grow">
        <FAQContent />
      </main>
      <Footer />
    </>
  )
}
