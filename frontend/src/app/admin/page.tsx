"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Package, ShoppingBag, Users, TrendingUp, DollarSign, Clock } from "lucide-react"

interface DashboardStats {
  totalProducts: number
  activeProducts: number
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  newCustomers: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    newCustomers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login?redirect=/admin")
        return
      }

      const headers = { Authorization: `Bearer ${token}` }

      // Fetch products data
      const productsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/admin-all`, { headers })
      const productsData = await productsRes.json()

      // Fetch orders data
      const ordersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, { headers })
      const ordersData = await ordersRes.json()

      if (productsRes.ok && ordersRes.ok) {
        // Calculate stats from the fetched data
        const activeProducts = productsData.filter((p: any) => p.isActive).length
        const pendingOrders = ordersData.filter((o: any) => o.status === "pending").length
        const totalRevenue = ordersData.reduce((sum: number, order: any) => sum + order.grandTotal, 0)

        // Get unique customers from orders (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const recentOrders = ordersData.filter((o: any) => new Date(o.createdAt) > thirtyDaysAgo)
        const uniqueCustomers = new Set(recentOrders.map((o: any) => o.shippingAddress.email)).size

        setStats({
          totalProducts: productsData.length,
          activeProducts,
          totalOrders: ordersData.length,
          pendingOrders,
          totalRevenue,
          newCustomers: uniqueCustomers,
        })
      } else {
        setError("Failed to fetch dashboard data. Please check server logs.")
        console.error("Dashboard fetch errors:", { productsData, ordersData })
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err)
      setError("Network error or server is unreachable.")
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({
    title,
    value,
    icon: Icon,
    subtitle,
    color = "bg-white",
  }: {
    title: string
    value: string | number
    icon: any
    subtitle: string
    color?: string
  }) => (
    <div className={`${color} p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{loading ? "..." : value}</p>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className="p-3 bg-beige_dark/10 rounded-lg">
          <Icon className="h-6 w-6 text-beige_dark" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-light text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here&apos;s what&apos;s happening with your store.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <p className="font-medium">Error loading dashboard data</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="mt-2 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          subtitle={`${stats.activeProducts} active products`}
        />

        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          subtitle={`${stats.pendingOrders} pending orders`}
        />

        <StatCard
          title="Total Revenue"
          value={`PKR ${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          subtitle="All time revenue"
        />

        <StatCard title="New Customers" value={stats.newCustomers} icon={Users} subtitle="Last 30 days" />

        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={Clock}
          subtitle="Require attention"
          color="bg-orange-50"
        />

        <StatCard
          title="Active Products"
          value={stats.activeProducts}
          icon={TrendingUp}
          subtitle="Currently available"
          color="bg-green-50"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => router.push("/admin/add-product")}
            className="p-4 text-left border border-gray-200 rounded-lg hover:border-beige_dark hover:bg-beige_dark/5 transition-colors"
          >
            <Package className="h-6 w-6 text-beige_dark mb-2" />
            <p className="font-medium text-gray-900">Add Product</p>
            <p className="text-sm text-gray-600">Create new product</p>
          </button>

          <button
            onClick={() => router.push("/admin/products")}
            className="p-4 text-left border border-gray-200 rounded-lg hover:border-beige_dark hover:bg-beige_dark/5 transition-colors"
          >
            <Package className="h-6 w-6 text-beige_dark mb-2" />
            <p className="font-medium text-gray-900">Manage Products</p>
            <p className="text-sm text-gray-600">Edit existing products</p>
          </button>

          <button
            onClick={() => router.push("/admin/orders")}
            className="p-4 text-left border border-gray-200 rounded-lg hover:border-beige_dark hover:bg-beige_dark/5 transition-colors"
          >
            <ShoppingBag className="h-6 w-6 text-beige_dark mb-2" />
            <p className="font-medium text-gray-900">View Orders</p>
            <p className="text-sm text-gray-600">Process customer orders</p>
          </button>

          <button
            onClick={() => window.open("/", "_blank")}
            className="p-4 text-left border border-gray-200 rounded-lg hover:border-beige_dark hover:bg-beige_dark/5 transition-colors"
          >
            <TrendingUp className="h-6 w-6 text-beige_dark mb-2" />
            <p className="font-medium text-gray-900">View Store</p>
            <p className="text-sm text-gray-600">See public storefront</p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-3/4"></div>
              ))}
            </div>
          ) : (
            <div className="text-gray-600">
              <p className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>{stats.totalProducts} products in inventory</span>
              </p>
              <p className="flex items-center space-x-2 mt-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>{stats.totalOrders} total orders processed</span>
              </p>
              <p className="flex items-center space-x-2 mt-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span>{stats.pendingOrders} orders awaiting processing</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
