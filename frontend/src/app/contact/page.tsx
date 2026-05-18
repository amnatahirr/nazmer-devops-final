import Header from "@/components/header"
import Footer from "@/components/footer"
import ContactContent from "@/components/ContactContent"

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="flex-grow">
        <ContactContent />
      </main>
      <Footer />
    </>
  )
}
