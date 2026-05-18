"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import { motion } from "framer-motion"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Header />
      <motion.main
        className="flex-grow py-12 container mx-auto px-4"
        initial={{ opacity: 0, y: 50 }} // Start further down
        animate={{ opacity: 1, y: 0 }} // Animate to original position
        transition={{ duration: 0.7, ease: "easeOut" }} // Smoother and slightly longer transition
      >
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <p className="text-gray-700 mb-2">
            We collect information to provide better services to all our users. The types of information we collect
            include:
          </p>
          <ul className="list-disc list-inside text-gray-700 ml-4">
            <li>
              <strong>Personal Information:</strong> When you create an account, make a purchase, or contact us, we may
              collect personal information such as your name, email address, shipping address, billing address, phone
              number, and payment details.
            </li>
            <li>
              <strong>Usage Data:</strong> We collect information about how you interact with our website, such as pages
              visited, products viewed, time spent on pages, and other browsing behavior.
            </li>
            <li>
              <strong>Device Information:</strong> We may collect information about the device you use to access our
              services, including IP address, browser type, operating system, and unique device identifiers.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-700 mb-2">We use the information we collect for various purposes, including:</p>
          <ul className="list-disc list-inside text-gray-700 ml-4">
            <li>Processing and fulfilling your orders.</li>
            <li>Communicating with you about your orders, products, services, and promotional offers.</li>
            <li>Improving our website, products, and services.</li>
            <li>Personalizing your shopping experience.</li>
            <li>Detecting and preventing fraud and other illegal activities.</li>
            <li>Complying with legal obligations.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Share Your Information</h2>
          <p className="text-gray-700 mb-2">
            We do not sell or rent your personal information to third parties. We may share your information with:
          </p>
          <ul className="list-disc list-inside text-gray-700 ml-4">
            <li>
              <strong>Service Providers:</strong> Third-party vendors who perform services on our behalf, such as
              payment processing, shipping, data analysis, marketing, and customer service. These providers are
              obligated to protect your information and use it only for the purposes for which it was provided.
            </li>
            <li>
              <strong>Legal Requirements:</strong> When required by law, such as in response to a subpoena, court order,
              or other legal process.
            </li>
            <li>
              <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of all or a portion
              of our assets.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
          <p className="text-gray-700 mb-2">
            We implement a variety of security measures to maintain the safety of your personal information when you
            place an order or enter, submit, or access your personal information. These measures include encryption,
            firewalls, and secure socket layer (SSL) technology.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Your Choices and Rights</h2>
          <p className="text-gray-700 mb-2">You have certain rights regarding your personal information:</p>
          <ul className="list-disc list-inside text-gray-700 ml-4">
            <li>
              <strong>Access and Correction:</strong> You can access and update your account information by logging into
              your account.
            </li>
            <li>
              <strong>Opt-Out:</strong> You can opt-out of receiving promotional emails from us by following the
              unsubscribe instructions in those emails.
            </li>
            <li>
              <strong>Cookies:</strong> You can set your browser to refuse all or some browser cookies, or to alert you
              when websites set or access cookies.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Third-Party Links</h2>
          <p className="text-gray-700 mb-2">
            Our website may contain links to third-party websites. We are not responsible for the privacy practices or
            content of these third-party sites. We encourage you to review the privacy policies of any third-party sites
            you visit.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Changes to This Privacy Policy</h2>
          <p className="text-gray-700 mb-2">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
            Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
          <p className="text-gray-700 mb-2">If you have any questions about this Privacy Policy, please contact us:</p>
          <ul className="list-disc list-inside text-gray-700 ml-4">
            <li>
              By email:{" "}
              <a href="mailto:nazmerbrand@gmail.com" className="hover:underline">
                nazmerbrand@gmail.com
              </a>
            </li>
            <li>
              By visiting this page on our website:{" "}
              <a href="/contact" className="hover:underline">
                Contact
              </a>
            </li>
          </ul>
        </section>
      </motion.main>
      <Footer />
    </div>
  )
}
