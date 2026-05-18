import Header from "@/components/header"
import Footer from "@/components/footer"
import StorePolicyContent from "@/components/StorePolicyContent"

export default function StorePolicyPage() {
  return (
    <>
      <Header />
      <main className="flex-grow">
        <StorePolicyContent />
      </main>
      <Footer />
    </>
  )
}
