"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Ensure useSearchParams is imported if used
import Header from "@/components/header";
import Footer from "@/components/footer";
import ProductQuickView from "@/components/ProductQuickView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  SlidersHorizontal,
  X,
  Sparkles,
  ArrowUpDown,
  ChevronDown,
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  sku: string;
  images: string[];
  sizes: string[];
  description: string;
  category: string; // Changed to required for filtering
  details: {
    material: string;
    care: string;
    fit: string;
    origin: string;
  };
  createdAt: string; // Added for sorting by newest
}

interface Filters {
  category: string;
  priceRange: [number, number];
  sizes: string[];
  search: string;
  sortBy: string;
}

interface Category {
  name: string;
  value: string;
  isActive: boolean;
}

export default function ShopPage() {
  const router = useRouter(); // Initialize useRouter
  const searchParams = useSearchParams(); // Added useSearchParams to read URL query parameters
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { name: "All", value: "all", isActive: true },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>(""); // Added error state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null
  );
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false); // Added states for search bar toggle and sort dropdown
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false); // New state to track screen size

  const [filters, setFilters] = useState<Filters>({
    category: "all",
    priceRange: [0, 50000],
    sizes: [],
    search: "",
    sortBy: "newest", // Changed default sort to newest
  });

  const sortOptions = [
    { name: "Newest First", value: "newest" },
    { name: "New Arrivals", value: "new-arrivals" },
    { name: "Price - Low to High", value: "price-asc" },
    { name: "Price - High to Low", value: "price-desc" },
  ];

  const availableSizes = ["XS", "S", "M", "L", "XL", "XXL"];

  // Helper function to get full image URL
  const getFullImageUrl = (imagePath: string) => {
    if (!imagePath) return "/placeholder.svg?height=400&width=300";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath.replace(/^http:\/\//, "https://");
    }
    const cleanPath = imagePath.startsWith("/")
      ? imagePath.slice(1)
      : imagePath;
    return `${process.env.NEXT_PUBLIC_API_URL}/${cleanPath}`;
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(""); // Clear previous errors
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/product`;

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "No error message from server" }));
        throw new Error(
          `HTTP error! Status: ${response.status}. Message: ${
            errorData.message || response.statusText
          }`
        );
      }

      const data = await response.json();

      if (data.products) {
        setProducts(data.products);
      } else if (Array.isArray(data)) {
        // If the API directly returns an array of products
        setProducts(data);
      } else {
        setError(
          "Unexpected data format received from API. Expected { products: [] } or an array."
        );
        console.error("Unexpected data format:", data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(
        `Failed to fetch products: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Please ensure your backend server is running and accessible.`
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log(
        "Fetching categories from:",
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories`
      );
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories`
      );

      console.log("Categories response status:", response.status);

      if (!response.ok) {
        console.error("Failed to fetch categories, status:", response.status);
        return;
      }

      const data = await response.json();
      console.log("Categories data received:", data);

      if (Array.isArray(data)) {
        const allCategories = [
          { name: "All", value: "all", isActive: true },
          ...data.map((cat) => ({
            name: cat.name,
            value: cat.value,
            isActive: true, // All categories from API are active
          })),
        ];
        console.log("Setting categories:", allCategories);
        setCategories(allCategories);
      } else {
        console.error("Categories data is not an array:", data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Keep default categories if fetch fails
    }
  };

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam && categoryParam !== filters.category) {
      setFilters((prev) => ({ ...prev, category: categoryParam }));
    }
  }, [searchParams]);

  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  // Effect to determine screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 768); // md breakpoint in Tailwind CSS
    };

    // Set initial size
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize);

    // Clean up event listener
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const applyFilters = () => {
    let filtered = [...products];

    // Category filter
    if (filters.category !== "all") {
      filtered = filtered.filter(
        (product) =>
          product.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          product.sku.toLowerCase().includes(filters.search.toLowerCase()) // Added SKU to search
      );
    }

    // Price range filter
    filtered = filtered.filter(
      (product) =>
        product.price >= filters.priceRange[0] &&
        product.price <= filters.priceRange[1]
    );

    // Size filter
    if (filters.sizes.length > 0) {
      filtered = filtered.filter((product) =>
        product.sizes.some((size) => filters.sizes.includes(size))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "newest":
          // Assuming createdAt is a valid date string
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  };

  const updateFilter = (key: keyof Filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSize = (size: string) => {
    setFilters((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      category: "all",
      priceRange: [0, 50000],
      sizes: [],
      search: "",
      sortBy: "newest",
    });
  };

  const openQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };

  const closeQuickView = () => {
    setQuickViewProduct(null);
  };

  const handleShopNowClick = (product: Product) => {
    if (isLargeScreen) {
      // On tablet/laptop, open quick view
      setQuickViewProduct(product);
    } else {
      // On mobile, navigate to product detail page
      router.push(`/product/${product._id}`);
    }
  };

  const hasActiveFilters =
    filters.sizes.length > 0 ||
    filters.search ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 50000 ||
    filters.category !== "all" ||
    filters.sortBy !== "newest"; // Include sort in active filters check

  const activeFiltersCount =
    filters.sizes.length +
    (filters.search ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 50000 ? 1 : 0) +
    (filters.category !== "all" ? 1 : 0) +
    (filters.sortBy !== "newest" ? 1 : 0); // Count sort as an active filter

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-black">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-beige_dark"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-black">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="text-center bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto shadow-md">
            <h2 className="text-xl font-semibold text-red-700 mb-3">
              Error Loading Products
            </h2>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <Button
              onClick={fetchProducts}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Retry Fetching Products
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Header />
      <main className="flex-grow">
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-light mb-8 tracking-wide font-ubuntu">
              All Products
            </h1>
            <p className="text-gray-600 font-ubuntu">
              Welcome to our store! Browse our sustainable collection.
            </p>
          </div>

          {/* Original Category Filter Buttons */}
          <div className="container mx-auto px-4 mt-8 flex flex-wrap justify-center gap-4">
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={filters.category === cat.value ? "default" : "outline"}
                className={`${
                  filters.category === cat.value
                    ? "bg-beige_dark text-white hover:bg-third"
                    : "border-beige_dark text-beige_dark hover:bg-beige_dark hover:text-white"
                } px-6 py-2 rounded-full text-sm font-medium transition-colors`}
                onClick={() => updateFilter("category", cat.value)}
              >
                {cat.name}
              </Button>
            ))}
          </div>

          {/* Compact Filter Bar */}
          <div className="container mx-auto px-4 mt-8">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2 shadow-lg">
              {showSearchBar ? (
                // Search Bar Mode
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowSearchBar(false)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search products..."
                      value={filters.search}
                      onChange={(e) => updateFilter("search", e.target.value)}
                      className="pl-10 pr-4 py-2 border-gray-200 rounded-xl focus:border-beige_dark focus:ring-2 focus:ring-beige_dark/20 transition-all"
                      autoFocus
                    />
                  </div>
                </div>
              ) : (
                // Filter/Sort/Search Buttons Mode
                <div className="flex items-center justify-between">
                  {/* Filters Button */}
                  <button
                    onClick={() => setShowFilterPanel(true)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-beige_dark transition-colors"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters ({filteredProducts.length} items)
                  </button>

                  <div className="flex items-center gap-[10px] md:gap-4">
                    {/* Sort Button */}
                    <div className="relative">
                      <button
                        onClick={() => setShowSortDropdown(!showSortDropdown)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-beige_dark transition-colors"
                      >
                        <ArrowUpDown className="h-4 w-4" />
                        Sort
                        <ChevronDown className="h-4 w-4" />
                      </button>

                      {showSortDropdown && !isLargeScreen && (
                        <>
                          {/* Mobile Sort Modal */}
                          <div
                            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end"
                            onClick={() => setShowSortDropdown(false)}
                          >
                            <div
                              className="w-full bg-white rounded-t-3xl p-6 transform transition-transform duration-300 ease-out"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="text-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-800">
                                  Sort By
                                </h3>
                              </div>
                              <div className="space-y-1">
                                {sortOptions.map((option, index) => (
                                  <div key={option.value}>
                                    <button
                                      onClick={() => {
                                        updateFilter("sortBy", option.value);
                                        setShowSortDropdown(false);
                                      }}
                                      className={`w-full py-4 text-center text-base font-medium transition-colors ${
                                        filters.sortBy === option.value
                                          ? "text-beige_dark"
                                          : "text-gray-700"
                                      }`}
                                    >
                                      {option.name}
                                    </button>
                                    {index < sortOptions.length - 1 && (
                                      <div className="border-b border-gray-200" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {showSortDropdown && isLargeScreen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowSortDropdown(false)}
                          />
                          <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 py-4">
                            <div className="px-6 py-3 border-b border-gray-100">
                              <h3 className="text-lg font-semibold text-gray-800">
                                Sort By
                              </h3>
                            </div>
                            <div className="py-2">
                              {sortOptions.map((option) => (
                                <button
                                  key={option.value}
                                  onClick={() => {
                                    updateFilter("sortBy", option.value);
                                    setShowSortDropdown(false);
                                  }}
                                  className={`w-full px-6 py-3 text-left text-sm font-medium transition-colors hover:bg-gray-50 ${
                                    filters.sortBy === option.value
                                      ? "text-beige_dark bg-beige_dark/5"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {option.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Search Button */}
                    <button
                      onClick={() => setShowSearchBar(true)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-beige_dark transition-colors"
                    >
                      <Search className="h-4 w-4" />
                      Search
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {showFilterPanel && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
                onClick={() => setShowFilterPanel(false)}
              />

              {/* Side Drawer */}
              <div
                className={`fixed top-0 left-0 h-full w-[400px] bg-white z-50 transform transition-transform duration-500 ease-out ${
                  showFilterPanel ? "translate-x-0" : "-translate-x-full"
                }`}
              >
                <div className="h-full flex flex-col">
                  {/* Panel Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Filters
                    </h2>
                    <button
                      onClick={() => setShowFilterPanel(false)}
                      className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Panel Content */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Price Range */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-beige_dark" />
                          Price Range
                        </Label>
                        <div className="bg-beige_dark text-white px-3 py-1 rounded-full text-sm font-medium">
                          PKR {filters.priceRange[0].toLocaleString()} - PKR{" "}
                          {filters.priceRange[1].toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <Slider
                          value={filters.priceRange}
                          onValueChange={(value) =>
                            updateFilter("priceRange", value)
                          }
                          max={50000}
                          min={0}
                          step={500}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-3">
                          <span className="bg-white px-2 py-1 rounded-md shadow-sm">
                            PKR 0
                          </span>
                          <span className="bg-white px-2 py-1 rounded-md shadow-sm">
                            PKR 50,000
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sizes */}
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-beige_dark" />
                        Available Sizes
                      </Label>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="grid grid-cols-3 gap-3">
                          {availableSizes.map((size) => (
                            <Button
                              key={size}
                              onClick={() => toggleSize(size)}
                              className={`h-12 rounded-xl font-semibold transition-all duration-300 ${
                                filters.sizes.includes(size)
                                  ? "bg-gradient-to-r from-beige_dark to-third text-white shadow-lg scale-105"
                                  : "bg-white text-gray-600 border-2 border-gray-200 hover:border-third hover:bg-third"
                              }`}
                            >
                              {size}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Active Filters */}
                    {hasActiveFilters && (
                      <div className="space-y-4">
                        <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-beige_dark" />
                          Active Filters
                        </Label>
                        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {filters.category !== "all" && (
                              <Badge className="bg-blue-500 text-white px-3 py-1 rounded-full">
                                {
                                  categories.find(
                                    (c) => c.value === filters.category
                                  )?.name
                                }
                                <X
                                  className="h-3 w-3 ml-2 cursor-pointer"
                                  onClick={() =>
                                    updateFilter("category", "all")
                                  }
                                />
                              </Badge>
                            )}
                            {filters.search && (
                              <Badge className="bg-third text-white px-3 py-1 rounded-full">
                                "{filters.search}"
                                <X
                                  className="h-3 w-3 ml-2 cursor-pointer"
                                  onClick={() => updateFilter("search", "")}
                                />
                              </Badge>
                            )}
                            {(filters.priceRange[0] > 0 ||
                              filters.priceRange[1] < 50000) && (
                              <Badge className="bg-green-500 text-white px-3 py-1 rounded-full">
                                PKR {filters.priceRange[0]} -{" "}
                                {filters.priceRange[1]}
                                <X
                                  className="h-3 w-3 ml-2 cursor-pointer"
                                  onClick={() =>
                                    updateFilter("priceRange", [0, 50000])
                                  }
                                />
                              </Badge>
                            )}
                            {filters.sizes.map((size) => (
                              <Badge
                                key={size}
                                className="bg-third text-white px-3 py-1 rounded-full"
                              >
                                Size {size}
                                <X
                                  className="h-3 w-3 ml-2 cursor-pointer"
                                  onClick={() => toggleSize(size)}
                                />
                              </Badge>
                            ))}
                            {filters.sortBy !== "newest" && (
                              <Badge className="bg-purple-500 text-white px-3 py-1 rounded-full">
                                Sort:{" "}
                                {
                                  sortOptions.find(
                                    (s) => s.value === filters.sortBy
                                  )?.name
                                }
                                <X
                                  className="h-3 w-3 ml-2 cursor-pointer"
                                  onClick={() =>
                                    updateFilter("sortBy", "newest")
                                  }
                                />
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Panel Footer */}
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <div className="flex gap-3">
                      <Button
                        onClick={clearAllFilters}
                        variant="outline"
                        className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent"
                      >
                        Clear All
                      </Button>
                      <Button
                        onClick={() => setShowFilterPanel(false)}
                        className="flex-1 bg-gradient-to-r from-beige_dark to-amber-600 text-white hover:from-amber-600 hover:to-beige_dark"
                      >
                        Apply Filters
                      </Button>
                    </div>
                    <div className="text-center mt-3 text-sm text-gray-600">
                      {filteredProducts.length} products found
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Products Display */}
          {filteredProducts.length === 0 ? (
            <div className="container mx-auto px-4 mt-12">
              <div className="text-center py-16 bg-gray-50 rounded-2xl">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-2xl font-light text-gray-900 mb-3 font-ubuntu">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Try adjusting your filters to find what you're looking for.
                </p>
                <Button
                  onClick={clearAllFilters}
                  className="bg-beige_dark text-white hover:bg-third px-8 py-3 rounded-xl"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="container mx-auto px-4 mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <div key={product._id} className="group">
                  <div className="relative overflow-hidden border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-300">
                    <img
                      src={
                        getFullImageUrl(product.images[0]) || "/placeholder.svg"
                      } // Use getFullImageUrl
                      alt={product.name}
                      className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        console.error(
                          "Image failed to load:",
                          product.images?.[0]
                        );
                        e.currentTarget.src =
                          "/placeholder.svg?height=400&width=300"; // Fallback image
                      }}
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 bg-beige_dark text-white text-sm uppercase tracking-wider flex items-center justify-center h-12 transition-transform duration-300 cursor-pointer"
                      onClick={() => handleShopNowClick(product)}
                    >
                      Shop Now
                    </div>
                  </div>
                  <div className="p-4 text-left">
                    <h2 className="text-lg font-light font-ubuntu">
                      {product.name}
                    </h2>
                    {product.category && ( // Display category if available
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                        {product.category}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 mt-1">
                      {product.originalPrice &&
                      product.price < product.originalPrice ? (
                        <>
                          <span className="text-gray-400 line-through text-sm">
                            PKR {product.originalPrice.toFixed(2)}
                          </span>
                          <p className="text-beige_dark font-medium">
                            PKR {product.price.toFixed(2)}
                          </p>
                        </>
                      ) : (
                        <p className="text-beige_dark font-medium">
                          PKR {product.price.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />

      {quickViewProduct && (
        <ProductQuickView
          isOpen={!!quickViewProduct}
          onClose={closeQuickView}
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
    </div>
  );
}
