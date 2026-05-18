"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import FloatingAppointmentButton from "@/components/floating-appointment-button";
import ProductQuickView from "@/components/ProductQuickView";
import { useIsMobile } from "../hooks/use-mobile";

interface NewArrivalProduct {
  _id: string;
  name: string;
  images: string[];
  price: number;
  originalPrice?: number;
  sku: string;
  sizes?: string[];
}

interface HomepageImage {
  _id: string;
  position: "left" | "right";
  imageUrl: string;
  altText: string;
}

export default function HomePage() {
  const router = useRouter();
  const isMobile = useIsMobile();

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      source: "Line/Magazine",
      quote:
        "The sustainable approach combined with timeless design makes Nazmer a standout in contemporary fashion.",
    },
    {
      id: 2,
      source: "Fashion Weekly",
      quote:
        "Nazmer's attention to detail and craftsmanship is unparalleled. Each piece tells a story of elegance and sophistication.",
    },
    {
      id: 3,
      source: "Style Today",
      quote:
        "The sustainable approach combined with timeless design makes Nazmer a standout in contemporary fashion.",
    },
  ];

  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Auto-play functionality for testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const goToTestimonial = (index: number) => {
    setCurrentTestimonial(index);
  };

  // New Arrivals data (fetched from API)
  const [newArrivals, setNewArrivals] = useState<NewArrivalProduct[]>([]);
  const [loadingNewArrivals, setLoadingNewArrivals] = useState(true);
  const [currentNewArrival, setCurrentNewArrival] = useState(0);

  // Homepage images data (fetched from API)
  const [homepageImages, setHomepageImages] = useState<HomepageImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);

  // QuickView state
  const [quickViewProduct, setQuickViewProduct] =
    useState<NewArrivalProduct | null>(null);

  useEffect(() => {
    fetchNewArrivals();
    fetchHomepageImages();
  }, []);

  const fetchNewArrivals = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product/new-arrivals`
      );
      if (response.ok) {
        const data = await response.json();
        setNewArrivals(data);
      }
    } catch (error) {
      console.error("Error fetching new arrivals:", error);
    } finally {
      setLoadingNewArrivals(false);
    }
  };

  const fetchHomepageImages = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/homepage/images`
      );
      if (response.ok) {
        const data = await response.json();
        setHomepageImages(data);
      }
    } catch (error) {
      console.error("Error fetching homepage images:", error);
    } finally {
      setLoadingImages(false);
    }
  };

  const getFullImageUrl = (imagePath: string) => {
    if (!imagePath) return "/placeholder.svg";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      if (imagePath.includes("localhost")) {
        return imagePath;
      }
      return imagePath.replace(/^http:\/\//, "https://");
    }
    const cleanPath = imagePath.startsWith("/")
      ? imagePath.slice(1)
      : imagePath;
    return `${process.env.NEXT_PUBLIC_API_URL}/${cleanPath}`;
  };

  const nextNewArrival = () => {
    setCurrentNewArrival((prev) => (prev + 1) % newArrivals.length);
  };

  const prevNewArrival = () => {
    setCurrentNewArrival(
      (prev) => (prev - 1 + newArrivals.length) % newArrivals.length
    );
  };

  // Handle product click with responsive behavior
  const handleProductClick = (product: NewArrivalProduct) => {
    if (isMobile) {
      // Mobile: Direct to product page
      router.push(`/product/${product._id}`);
    } else {
      // Desktop: Show quickview modal
      setQuickViewProduct(product);
    }
  };

  // Get left and right images
  const leftImage = homepageImages.find((img) => img.position === "left");
  const rightImage = homepageImages.find((img) => img.position === "right");

  return (
    <div className="min-h-screen bg-white text-header">
      <Header />
      {/* Hero Section */}
      <section className="py-16 md:py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-6xl font-ubuntu font-light mb-6 md:mb-8 tracking-wide ">
            Sustainable. Beautiful. Ethical.
          </h1>
          <Button
            className="bg-beige_dark hover:bg-third text-white px-6 py-2 text-base md:px-8 md:py-3 md:text-lg"
            onClick={() => router.push("/shop")}
          >
            Shop Now
          </Button>
        </div>
      </section>

      {/* Product Images Section */}
      <section className="grid md:grid-cols-2">
        <div className="relative h-auto md:h-[700px]">
          {loadingImages ? (
            <div className="w-full h-96 md:h-[700px] bg-gray-200 animate-pulse flex items-center justify-center">
              <span className="text-gray-500">Loading...</span>
            </div>
          ) : (
            <Image
              src={
                leftImage
                  ? getFullImageUrl(leftImage.imageUrl)
                  : "/products/pic5.jpeg"
              }
              alt={leftImage?.altText || "Woman in sustainable fashion"}
              fill
              className="object-cover object-center w-full h-full"
              crossOrigin="anonymous"
            />
          )}
        </div>
        <div className="relative h-96 md:h-[700px]">
          {loadingImages ? (
            <div className="w-full h-96 md:h-[700px] bg-gray-200 animate-pulse flex items-center justify-center">
              <span className="text-gray-500">Loading...</span>
            </div>
          ) : (
            <Image
              src={
                rightImage
                  ? getFullImageUrl(rightImage.imageUrl)
                  : "/products/pic9.jpeg"
              }
              alt={rightImage?.altText || "Man in sustainable clothing"}
              fill
              className="object-cover"
              crossOrigin="anonymous"
            />
          )}
        </div>
      </section>
      {/* Ethically Made Section */}
      <section className="relative py-16 md:py-20 overflow-hidden min-h-[650px] flex items-center justify-center">
        {/* Fabric Image from Left (Hidden on mobile) */}
        <motion.div
          initial={{ x: "-150%", y: "-70%", opacity: 0 }}
          whileInView={{ x: "-120%", y: "-70%", opacity: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="absolute w-[115px] top-[264px] left-[356px] h-[140px] md:top-[73%] md:left-[54%] md:w-[405px] md:h-[505px] z-10 md:z-0  md:block"
        >
          <Image
            src="/about/ab3.jpg"
            alt="White fabric texture"
            fill
            className="object-cover rounded-lg shadow-md"
          />
        </motion.div>
        {/* Cotton Image from Right (Hidden on mobile) */}
        <motion.div
          initial={{ x: "50%", y: "10%", opacity: 0 }}
          whileInView={{ x: "20%", y: "10%", opacity: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="absolute top-[24px] w-[181px] left-0 h-[256px] md:top-[47%] md:left-[39%] md:w-[570px] md:h-[441px] z-10 md:z-0  md:block"
        >
          <Image
            src="/background/aes2.jpeg"
            alt="Hand picking cotton"
            fill
            className="object-cover rounded-lg shadow-md"
          />
        </motion.div>
        {/* Text box from Top */}
        <motion.div
          initial={{ y: -200, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="absolute top-[46%] md:relative bg-beige h-[363px] md:h-auto p-8 md:p-12 md:max-w-sm mx-auto text-center md:z-10 shadow-lg md:flex flex-col justify-center items-center"
        >
          <h2 className="text-3xl md:text-4xl font-light mb-4 text-gray-800">
            Ethically Made
          </h2>
          <p className="text-base text-gray-600 mb-6">
           At Namzer, every stitch tells a story of craftsmanship and care.
Our pieces are designed with timeless style, responsibly made to honor both the hands that create them and the people who wear them.
          </p>
          <Button className="bg-beige_dark hover:bg-third text-white px-2 py-3 text-base">
            Learn More
          </Button>
        </motion.div>
      </section>
      {/* Featured Products Section (New Arrivals Carousel) */}
      <section className="py-16">
        <div className="container mx-auto px-4 relative">
          <h1 className="text-2xl md:text-[38px] text-center font-ubuntu font-light my-12 md:my-[90px] tracking-wide text-header ">
            New Arrivals
          </h1>

          {loadingNewArrivals ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-beige_dark mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading new arrivals...</p>
            </div>
          ) : newArrivals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">
                No new arrivals available at the moment.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile View - Always show slider */}
              <div className="relative flex items-center justify-center md:hidden">
                {newArrivals.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-[-4px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 hover:bg-beige_dark/10"
                    onClick={prevNewArrival}
                  >
                    <ChevronLeft className="!h-8 !w-8 !text-gray-600" />
                  </Button>
                )}

                <div className="w-full max-w-md mx-auto">
                  <div
                    className="group cursor-pointer"
                    onClick={() =>
                      handleProductClick(newArrivals[currentNewArrival])
                    }
                  >
                    <div className="relative h-96 mb-4 mx-[40px] overflow-hidden">
                      <Image
                        src={
                          getFullImageUrl(
                            newArrivals[currentNewArrival].images[0]
                          ) || "/placeholder.svg"
                        }
                        alt={newArrivals[currentNewArrival].name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        crossOrigin="anonymous"
                      />
                    </div>
                    <h3 className="text-xl font-medium text-center text-header">
                      {newArrivals[currentNewArrival].name}
                    </h3>
                  </div>
                </div>

                {newArrivals.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-[-4px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 hover:bg-beige_dark/10"
                    onClick={nextNewArrival}
                  >
                    <ChevronRight className="!h-8 !w-8 !text-gray-600" />
                  </Button>
                )}
              </div>

              {/* Desktop View - Grid for ≤3 products, Slider for >3 products */}
              <div className="hidden md:block">
                {newArrivals.length <= 3 ? (
                  // Grid layout for 3 or fewer products
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8 justify-items-center">
                    {newArrivals.map((product) => (
                      <div
                        key={product._id}
                        className="group cursor-pointer"
                        onClick={() => handleProductClick(product)}
                      >
                        <div className="relative h-96 md:h-[427px] md:w-[427px] mb-4 overflow-hidden">
                          <Image
                            src={
                              getFullImageUrl(product.images[0]) ||
                              "/placeholder.svg"
                            }
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            crossOrigin="anonymous"
                          />
                        </div>
                        <h3 className="text-xl md:text-[24px] font-medium text-center text-header">
                          {product.name}
                        </h3>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Slider layout for more than 3 products
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-10 w-12 h-12 hover:bg-beige_dark/10"
                      onClick={prevNewArrival}
                    >
                      <ChevronLeft className="!h-8 !w-8 !text-gray-600" />
                    </Button>

                    <div className="overflow-hidden">
                      <div
                        className="flex transition-transform duration-300 ease-in-out"
                        style={{
                          transform: `translateX(-${
                            currentNewArrival * (100 / 3)
                          }%)`,
                        }}
                      >
                        {newArrivals.map((product) => (
                          <div
                            key={product._id}
                            className="w-1/3 flex-shrink-0 px-4"
                          >
                            <div
                              className="group cursor-pointer"
                              onClick={() => handleProductClick(product)}
                            >
                              <div className="relative h-96 md:h-[500px] mb-4 overflow-hidden">
                                <Image
                                  src={
                                    getFullImageUrl(product.images[0]) ||
                                    "/placeholder.svg"
                                  }
                                  alt={product.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  crossOrigin="anonymous"
                                />
                              </div>
                              <h3 className="text-xl md:text-[24px] font-medium text-center text-header">
                                {product.name}
                              </h3>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-10 w-12 h-12 hover:bg-beige_dark/10"
                      onClick={nextNewArrival}
                    >
                      <ChevronRight className="!h-8 !w-8 !text-gray-600" />
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
      {/* Brand Story Section */}
      <section className="py-20 md:py-40 bg-[url('/background/aes2.jpeg')] bg-cover bg-center w-auto">
        <div className="container mx-auto px-4">
          <div className="max-w-full md:max-w-3xl mx-auto text-center relative">
            {/* Content */}
            <div className="relative z-10 bg-white backdrop-blur-sm rounded-sm p-[48px] md:py-12 md:px-36 shadow-sm">
              <h2 className="text-2xl md:text-4xl font-light mb-6 md:mb-8 text-header leading-tight">
                Where every stitch honors
                <br />
                your Story
              </h2>

              <p className="text-base text-header mb-6 md:mb-8 leading-relaxed max-w-full md:max-w-2xl mx-auto">
                {`Originated within the intimate setting of a home atelier, guided by a singular vision and one master tailor, the 
                journey of Nazmer unfolded with quiet determination.
                 What began as a humble pursuit soon flourished into Nazmer—a distinguished designer label renowned for its bespoke craftsmanship.
                `}
              </p>

              <Button className="bg-beige_dark hover:bg-third text-white px-6 py-2 text-base md:px-8 md:py-3 md:text-base">
                See More
              </Button>
            </div>
          </div>
        </div>
      </section>
      {/* Testimonial Section */}
      <section className="py-20 md:py-40 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center relative max-w-full md:max-w-4xl mx-auto">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 hover:bg-beige_dark/10"
              onClick={prevTestimonial}
            >
              <ChevronLeft className="!h-8 !w-8 md:!h-12 md:!w-12 !text-gray-600" />
            </Button>

            <div className="border border-black inline-block px-4 py-1 mb-6 md:px-6 md:py-2 md:mb-8 transition-all duration-500">
              <span className="text-sm tracking-wider">
                {testimonials[currentTestimonial].source}
              </span>
            </div>

            <blockquote className="text-base md:text-xl text-gray-700 mb-6 p-[30px] md:mb-8 max-w-full md:max-w-2xl mx-auto min-h-[120px] flex items-center justify-center transition-all duration-500">
              {testimonials[currentTestimonial].quote}
            </blockquote>

            <div className="flex justify-center space-x-2 mb-4">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentTestimonial
                      ? "bg-black"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 hover:bg-beige_dark/10"
              onClick={nextTestimonial}
            >
              <ChevronRight className="!h-8 !w-8 md:!h-12 md:!w-12 !text-gray-600" />
            </Button>
          </div>
        </div>
      </section>

      {/* Product QuickView Modal - Only shown on desktop */}
      {quickViewProduct && !isMobile && (
        <ProductQuickView
          isOpen={true}
          onClose={() => setQuickViewProduct(null)}
          product={{
            id: quickViewProduct._id,
            name: quickViewProduct.name,
            price: quickViewProduct.price,
            originalPrice: quickViewProduct.originalPrice,
            sku: quickViewProduct.sku,
            image: quickViewProduct.images[0],
            images: quickViewProduct.images,
            sizes: quickViewProduct.sizes,
          }}
        />
      )}

      <Footer />
      <FloatingAppointmentButton />
    </div>
  );
}
