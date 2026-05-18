"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LogOut, Menu } from "lucide-react";
import CartDrawer from "./CartDrawerr";
import MobileSidebar from "./MobileSidebar"; // Import the new MobileSidebar
import { useCart } from "@/contexts/CartContext";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isEmailVerified: boolean;
  role: string;
}

export default function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu
  const [user, setUser] = useState<UserData | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();
  const { state } = useCart();

  useEffect(() => {
    // Check for user data in localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setShowUserMenu(false);
    window.location.href = "/";
  };

  return (
    <>
      <header className="border-b border-gray-100">
        {/* Top Banner */}
        <div className="bg-beige text-center py-3 text-sm">
          Where Every Stitch Honors Your Story | N A Z M E R
        </div>
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          {/* Logo and Shopping Bag on Mobile */}
          <div className="flex items-center gap-2 md:gap-0">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-transparent relative md:hidden"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5 text-gray-600" />
              {state.totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-beige_dark text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {state.totalItems}
                </span>
              )}
            </Button>
            <Link
              href="/"
              className="text-2xl font-bold tracking-wider text-black"
            >
              N A Z M E R
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="flex justify-between gap-40 items-center">
            <nav className="hidden md:flex items-end space-x-8 font-ubuntu font-light">
              <Link
                href="/"
                className={`${
                  pathname === "/" ? "text-beige_dark" : "text-gray-600"
                } hover:text-beige_dark transition-colors`}
              >
                Home
              </Link>

              <Link
                href="/shop"
                className={`${
                  pathname?.startsWith("/shop")
                    ? "text-beige_dark"
                    : "text-gray-600"
                } hover:text-beige_dark transition-colors`}
              >
                Shop
              </Link>

              <Link
                href="/about"
                className={`${
                  pathname === "/about" ? "text-beige_dark" : "text-gray-600"
                } hover:text-beige_dark transition-colors`}
              >
                About
              </Link>
            </nav>

            {/* Desktop Icons and Mobile Hamburger */}
            <div className="flex items-center space-x-6 font-ubuntu font-light">
              {/* Desktop User/Login */}
              <div className="hidden md:block">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors"
                    >
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">{user.firstName}</span>
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                        <div className="px-4 py-2 text-sm text-gray-700 border-b">
                          <p className="font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-gray-500 text-xs">{user.email}</p>
                        </div>
                        {user.role === "admin" && (
                          <Link
                            href="/admin"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowUserMenu(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-black transition-colors"
                  >
                    Log In
                  </Link>
                )}
              </div>

              {/* Desktop Cart Icon */}
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-transparent relative hidden md:flex"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5 text-gray-600" />
                {state.totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-beige_dark text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {state.totalItems}
                  </span>
                )}
              </Button>

              {/* Mobile Hamburger Menu */}
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-transparent relative md:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6 text-gray-600" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-In Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
        handleLogout={handleLogout}
      />

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
}
