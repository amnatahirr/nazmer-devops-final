import Header from "@/components/header"
import Footer from "@/components/footer"
import AccessibilityContent from "@/components/AccessibilityContent"

export default function AccessibilityPage() {
  return (
    <>
      <Header />
      <main className="flex-grow">
        <AccessibilityContent />
      </main>
      <Footer />
    </>
  )
}
