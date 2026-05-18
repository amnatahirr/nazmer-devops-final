"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { X, User, LogOut, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isEmailVerified: boolean;
  role: string;
}

interface Category {
  _id: string;
  name: string;
  value: string;
  description?: string;
  isActive: boolean;
  order: number;
}

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserData | null;
  handleLogout: () => void;
}

export default function MobileSidebar({
  isOpen,
  onClose,
  user,
  handleLogout,
}: MobileSidebarProps) {
  const pathname = usePathname();
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]); // Changed to dynamic categories state

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories`
      );

      if (!response.ok) {
        console.error("Failed to fetch categories:", response.status);
        return;
      }

      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Keep empty array as fallback
    }
  };

  const displayCategories = [
    { name: "All", value: "all" },
    ...categories.sort((a, b) => a.order - b.order),
  ];

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "About", href: "/about" },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-[300px] flex flex-col  sm:w-[400px] bg-[rgb(237,229,223)] p-0"
      >
        <SheetHeader className="flex flex-row items-center justify-between px-6 pt-16 pb-4 border-b">
          {user ? (
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-800">
                {user.firstName}
              </span>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-lg font-medium text-[30362C]"
              onClick={onClose}
            >
              Log In
            </Link>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="!h-[40px] !w-[40px] text-[30362C]" />
            <span className="sr-only h-[11.31px] w-[11.31px]">Close menu</span>
          </Button>
        </SheetHeader>
        <nav className="flex flex-col p-8 space-y-4 font-ubuntu font-light text-[24px]">
          {navLinks.map((link) => (
            <div key={link.name}>
              {link.name === "Shop" ? (
                <div>
                  <div className="flex items-center justify-between">
                    <Link
                      href={link.href}
                      className={`${
                        pathname === link.href ||
                        (link.href !== "/" && pathname.startsWith(link.href))
                          ? "text-beige_dark"
                          : "text-text-[30362C]"
                      } hover:text-beige_dark transition-colors`}
                      onClick={onClose}
                    >
                      {link.name}
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                      className="p-1 h-auto"
                    >
                      {isCategoriesOpen ? (
                        <ChevronUp className="h-4 w-4 text-[30362C]" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-[30362C]" />
                      )}
                    </Button>
                  </div>
                  {isCategoriesOpen && (
                    <div className="ml-4 mt-2 space-y-2">
                      {displayCategories.map((category) => (
                        <Link
                          key={category.value}
                          href={
                            category.value === "all"
                              ? "/shop"
                              : `/shop?category=${category.value}`
                          }
                          className="block text-[18px] text-gray-600 hover:text-beige_dark transition-colors py-1"
                          onClick={onClose}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={link.href}
                  className={`${
                    pathname === link.href ||
                    (link.href !== "/" && pathname.startsWith(link.href))
                      ? "text-beige_dark"
                      : "text-text-[30362C]"
                  } hover:text-beige_dark transition-colors`}
                  onClick={onClose}
                >
                  {link.name}
                </Link>
              )}
            </div>
          ))}
          {user && (
            <>
              <div className="border-t pt-4 mt-4">
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="block py-2 text-gray-700 hover:text-beige_dark transition-colors"
                    onClick={onClose}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:text-beige_dark transition-colors px-0 py-2"
                  onClick={() => {
                    handleLogout();
                    onClose();
                  }}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  <span>Logout</span>
                </Button>
              </div>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
