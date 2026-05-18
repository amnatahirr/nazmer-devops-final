"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ShoppingCart } from "lucide-react";

export default function AboutPage() {
  const [isInView, setIsInView] = useState(false);
  const [isBespokeInView, setIsBespokeInView] = useState(false);
  const [isAtelierInView, setIsAtelierInView] = useState(false);
  const [isLuxuriousInView, setIsLuxuriousInView] = useState(false);
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = [
      { index: 0, setter: setIsBespokeInView },
      { index: 1, setter: setIsAtelierInView },
      { index: 2, setter: setIsLuxuriousInView },
      { index: 3, setter: setIsInView },
    ];

    observers.forEach(({ index, setter }) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setter(true);
            observer.disconnect();
          }
        },
        { threshold: 0.3 }
      );

      if (sectionsRef.current[index]) {
        observer.observe(sectionsRef.current[index]);
      }

      return () => observer.disconnect();
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Our Story Header */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-light mb-8 text-gray-800">
            Our Story
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Originated within the intimate setting of a home atelier, guided by
            a singular vision and one master tailor, the journey of Nazmer
            unfolded with quiet determination.
          </p>
        </div>
      </section>

      {/* Story Images */}
      <section className="py-8">
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="relative h-64 md:h-[341px] xl:h-[650px]">
              <Image
                src="/background/aes4.jpeg"
                alt="Master tailor at work"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative h-64 md:h-[345px] xl:h-[650px]">
              <Image
                src="/background/aes2.jpeg"
                alt="Luxury fabrics and threads"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative h-64 md:h-[345px] xl:h-[650px]">
              <Image
                src="/background/aes3.jpeg"
                alt="Intricate embellishments"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bespoke Craftsmanship Section */}
      <section className="py-16">
        <div
          className="container mx-auto px-4"
          ref={(el) => {
            sectionsRef.current[0] = el;
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center lg:my-10 xl:mx-[160px]">
            <div
              className={`relative h-96 lg:h-[660px] lg:w-[440px] transition-all duration-1000 ease-out transform ${
                isBespokeInView
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-12"
              }`}
            >
              <Image
                src="/about/ab1.jpg"
                alt="Bespoke bridal craftsmanship"
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div
              className={`lg:px-[60px] text-center transition-all duration-1000 ease-out transform ${
                isBespokeInView
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-12"
              }`}
            >
              <h2 className="text-3xl md:text-4xl font-light mb-6 text-gray-800">
                Bespoke Craftsmanship
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                What began as a humble pursuit soon flourished into Nazmer—a
                distinguished designer label renowned for its bespoke
                craftsmanship. Each garment is meticulously handcrafted, echoing
                the individuality and imagination of every client.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Specializing in couture bridal, formal, and festive wear, Nazmer
                unites luxurious textiles with intricate embellishments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Atelier Section */}
      <section className="py-16 bg-gray-50">
        <div
          className="container mx-auto px-4"
          ref={(el) => {
            sectionsRef.current[1] = el;
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center justify-end">
            <div
              className={`order-2 lg:order-1 lg:px-[130px] text-center transition-all duration-1000 ease-out transform ${
                isAtelierInView
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-12"
              }`}
            >
              <h2 className="text-3xl md:text-4xl font-light mb-6 text-gray-800">
                Our Atelier
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Our evolution is a reflection of resilience, refinement, and an
                unwavering dedication to timeless elegance. Every stitch tells a
                story of passion and precision.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We respect the artistry as much as we respect our clients,
                ensuring each piece reflects the highest standards of couture
                craftsmanship.
              </p>
            </div>
            <div
              className={`relative lg:h-[660px] lg:w-[440px] order-1 lg:order-2 transition-all duration-1000 ease-out transform ${
                isAtelierInView
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-12"
              }`}
            >
              <Image
                src="/about/ab2.jpg"
                alt="Our atelier workspace"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Luxurious Textiles Section */}
      <section className="py-16">
        <div
          className="container mx-auto px-4"
          ref={(el) => {
            sectionsRef.current[2] = el;
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center lg:my-10 xl:mx-[160px]">
            <div
              className={`relative h-96 lg:h-[660px] lg:w-[440px] transition-all duration-1000 ease-out transform ${
                isLuxuriousInView
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-12"
              }`}
            >
              <Image
                src="/about/ab3.jpg"
                alt="Luxurious textiles and fabrics"
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div
              className={`lg:px-[60px] text-center transition-all duration-1000 ease-out transform ${
                isLuxuriousInView
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-12"
              }`}
            >
              <h2 className="text-3xl md:text-4xl font-light mb-6 text-gray-800">
                Luxurious Textiles
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Crafted from the finest silks, organzas, and hand-selected
                materials from around the world. Each textile is chosen for its
                exceptional quality and ability to drape beautifully.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our intricate embellishments include hand-beading, embroidery,
                and traditional techniques passed down through generations of
                master craftsmen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeless Heirlooms Section */}
      <section className="py-16 bg-gray-50">
        <div
          className="container mx-auto px-4"
          ref={(el) => {
            sectionsRef.current[3] = el;
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content (from left) */}
            <div
              className={`order-2 lg:order-1 lg:px-[100px] text-center transition-all duration-1000 ease-out transform ${
                isInView
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-12"
              }`}
            >
              <h2 className="text-3xl md:text-4xl font-light mb-6 text-gray-800">
                Timeless Heirlooms
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                At Nazmer, we do not simply create garments—we craft heirlooms
                that tell your story. Each piece is designed to be treasured for
                generations.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                From the first consultation to the final fitting, every detail
                is considered to ensure your vision becomes a reality that
                exceeds expectations.
              </p>
            </div>

            {/* Image (from right) */}
            <div
              className={`relative h-96 lg:h-[660px] lg:w-[440px] order-1 lg:order-2 transition-all duration-1000 ease-out transform ${
                isInView
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-12"
              }`}
            >
              <Image
                src="/about/ab4.jpg"
                alt="Finished couture piece"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .animate-in {
          opacity: 1 !important;
          transform: translateX(0) !important;
        }
      `}</style>
    </div>
  );
}
