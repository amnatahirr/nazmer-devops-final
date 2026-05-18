"use client";

import type React from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Package,
  ShoppingBag,
  LayoutDashboard,
  LogOut,
  Star,
  ImageIcon,
  Tags,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isEmailVerified: boolean;
  role: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userData || !token) {
      router.push("/login?redirect=/admin"); // Redirect to login if no user or token
      return;
    }

    try {
      const parsedUser: UserData = JSON.parse(userData);
      if (parsedUser.role !== "admin") {
        alert("Access Denied: You must be an administrator to view this page.");
        router.push("/"); // Redirect non-admins to home
        return;
      }
      setUser(parsedUser);
    } catch (error) {
      console.error("Error parsing user data:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.push("/login?redirect=/admin");
      return;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-beige_dark"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    // This state should ideally not be reached if the useEffect redirect works,
    // but as a fallback, we can show a message or redirect again.
    return null; // Or a simple "Access Denied" message
  }

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Categories", href: "/admin/categories", icon: Tags },
    { name: "New Arrivals", href: "/admin/new-arrivals", icon: Star },
    {
      name: "Homepage Images",
      href: "/admin/homepage-images",
      icon: ImageIcon,
    },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    // { name: 'Users', href: '/admin/users', icon: Users }, // Uncomment if you add user management
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 p-6 flex flex-col shadow-sm">
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-2xl font-bold tracking-wider text-black"
          >
            ADMIN PANEL
          </Link>
          {user && (
            <p className="text-sm text-gray-500 mt-2">
              Welcome, {user.firstName}!
            </p>
          )}
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-beige_dark text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-100">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
