"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import { motion } from "framer-motion"

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Header />
      <motion.main
        className="flex-grow py-12 container mx-auto px-4"
        initial={{ opacity: 0, y: 50 }} // Start further down
        animate={{ opacity: 1, y: 0 }} // Animate to original position
        transition={{ duration: 0.7, ease: "easeOut" }} // Smoother and slightly longer transition
      >
        <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-700 mb-2">
            By accessing and using this website and purchasing products from Nazmer, you agree to be bound by
            these Terms and Conditions, all applicable laws and regulations, and agree that you are responsible for
            compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited
            from using or accessing this site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
          <p className="text-gray-700 mb-2">
            Permission is granted to temporarily download one copy of the materials on Nazmer's website for personal, non-commercial transitory viewing only. This is the grant of a license,
            not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc list-inside text-gray-700 ml-4">
            <li>modify or copy the materials;</li>
            <li>
              use the materials for any commercial purpose, or for any public display (commercial or non-commercial);
            </li>
            <li>attempt to decompile or reverse engineer any software contained on Namzer's website;</li>
            <li>remove any copyright or other proprietary notations from the materials; or</li>
            <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
          </ul>
          <p className="text-gray-700 mt-2">
            This license shall automatically terminate if you violate any of these restrictions and may be terminated by
           Nazmer at any time. Upon terminating your viewing of these materials or upon the termination of
            this license, you must destroy any downloaded materials in your possession whether in electronic or printed
            format.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Disclaimer</h2>
          <p className="text-gray-700 mb-2">
            The materials on Nazmer's website are provided on an 'as is' basis. Nazmer makes no
            warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without
            limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or
            non-infringement of intellectual property or other violation of rights.
          </p>
          <p className="text-gray-700 mt-2">
            Further, Nazmer does not warrant or make any representations concerning the accuracy, likely
            results, or reliability of the use of the materials on its website or otherwise relating to such materials
            or on any sites linked to this site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Limitations</h2>
          <p className="text-gray-700 mb-2">
            In no event shall Nazmer or its suppliers be liable for any damages (including, without
            limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or
            inability to use the materials on Nazmer's website, even if Nazmer or a Nazmer authorized representative has been notified orally or in writing of the possibility of such damage.
            Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for
            consequential or incidental damages, these limitations may not apply to you.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Accuracy of Materials</h2>
          <p className="text-gray-700 mb-2">
            The materials appearing on Nazmer's website could include technical, typographical, or
            photographic errors. Nazmer does not warrant that any of the materials on its website are
            accurate, complete or current. Nazmer may make changes to the materials contained on its website
            at any time without notice. However Nazmer does not make any commitment to update the materials.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Links</h2>
          <p className="text-gray-700 mb-2">
            Nazmer has not reviewed all of the sites linked to its website and is not responsible for the
            contents of any such linked site. The inclusion of any link does not imply endorsement by Nazmer
            of the site. Use of any such linked website is at the user's own risk.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Modifications</h2>
          <p className="text-gray-700 mb-2">
            Nazmer may revise these Terms of Service for its website at any time without notice. By using
            this website you are agreeing to be bound by the then current version of these Terms of Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Governing Law</h2>
          <p className="text-gray-700 mb-2">
            These terms and conditions are governed by and construed in accordance with the laws of [Your State/Country]
            and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
          </p>
        </section>
      </motion.main>
      <Footer />
    </div>
  )
}
