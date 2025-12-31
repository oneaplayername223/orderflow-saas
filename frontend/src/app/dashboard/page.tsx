"use client"

import { useEffect, useState } from "react"
import { getMe, getMyOrders, updateOrder, logout } from "@/lib/api"
import { useRouter } from "next/navigation"

interface UserData {
  status: string
  role: string
  company_name: string
  email: string
  username: string
}

interface Order {
  id: number
  status: string
  totalAmount: number
  createdAt?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingOrder, setUpdatingOrder] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [dateFilter, setDateFilter] = useState<{ startDate?: string; endDate?: string }>({})
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      try {
        const userData = await getMe()
        setUser(userData)
        await fetchOrders(currentPage)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [currentPage])

  async function fetchOrders(page: number) {
    const ordersData = await getMyOrders(10, page, dateFilter)
    setOrders(ordersData)
    // Asumir que el backend devuelve totalPages, o calcular basado en length
    // Por ahora, si ordersData.length < 10, es la última página
    if (ordersData.length < 10) {
      setTotalPages(page)
    } else {
      setTotalPages(page + 1) // Estimado
    }
  }

  function handleDateFilterChange(newDateFilter: { startDate?: string; endDate?: string }) {
    setDateFilter(newDateFilter)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  // Effect to refetch data when date filter changes
  useEffect(() => {
    if (user) {
      fetchOrders(currentPage)
    }
  }, [dateFilter, currentPage, user])

  async function handleUpdate(orderId: number, status: string) {
    setUpdatingOrder(orderId)
    try {
      await updateOrder(orderId, status)
      await fetchOrders(currentPage)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setUpdatingOrder(null)
    }
  }

  async function handleLogout() {
    try {
      await logout()
      router.push("/login")
    } catch (err: any) {
      alert(err.message)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      // Normalizar ambas variantes de cancelado
      CANCELED: { label: "Cancelado", color: "bg-red-100 text-red-800" },
      CANCELLED: { label: "Cancelado", color: "bg-red-100 text-red-800" },
      CONFIRMED: { label: "Confirmado", color: "bg-green-100 text-green-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: "bg-slate-100 text-slate-800" }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const totalOrders = orders.length
  // Mostrar canceladas en vez de pendientes
  const canceledOrders = orders.filter((o) => o.status === "CANCELED" || o.status === "CANCELLED").length
  const confirmedOrders = orders.filter((o) => o.status === "CONFIRMED").length
  const totalRevenue = orders
    .filter((o) => o.status === "CONFIRMED")
    .reduce((sum, o) => sum + Number(o.totalAmount), 0)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-lg text-gray-600">loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
              <span className="text-blue-600 font-bold">D</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold">Dashboard</h1>
              <p className="text-sm text-gray-600">{user.company_name}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Logout
          </button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Date Filter */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Filter by Date</h3>
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start date</label>
              <input
                type="date"
                value={dateFilter.startDate || ''}
                onChange={(e) => handleDateFilterChange({ ...dateFilter, startDate: e.target.value })}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End date</label>
              <input
                type="date"
                value={dateFilter.endDate || ''}
                onChange={(e) => handleDateFilterChange({ ...dateFilter, endDate: e.target.value })}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => handleDateFilterChange({})}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Limpiar Filtro
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
                <p className="text-xs text-gray-500">
                  {dateFilter.startDate || dateFilter.endDate ? 'Filtered by date' : '+ ' + canceledOrders + ' canceled'}
                </p>
              </div>
              <div className="text-blue-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold">{confirmedOrders}</p>
                <p className="text-xs text-gray-500">
                  {dateFilter.startDate || dateFilter.endDate ? 'Filtradas por fecha' : Math.round((confirmedOrders / totalOrders) * 100) + '% del total'}
                </p>
              </div>
              <div className="text-green-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue (Confirmed)</p>
                <p className="text-2xl font-bold">
                  ${totalRevenue.toLocaleString("es-MX", { minimumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-gray-500">
                  {dateFilter.startDate || dateFilter.endDate ? 'Filtered by date' : 'Average per confirmed order: $' + (confirmedOrders > 0 ? (totalRevenue / confirmedOrders).toFixed(2) : "0.00")}
                </p>
              </div>
              <div className="text-green-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">
                  {totalOrders > 0 ? Math.round((confirmedOrders / totalOrders) * 100) : 0}%
                </p>
                <p className="text-xs text-gray-500">
                  {dateFilter.startDate || dateFilter.endDate ? 'Filtered by date' : confirmedOrders + ' or ' + totalOrders + ' orders'}
                </p>
              </div>
              <div className="text-blue-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* User Profile */}
          <div className="bg-white p-6 rounded-lg shadow border lg:col-span-1">
            <h2 className="text-lg font-semibold mb-4">User Profile</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold">@</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">User</p>
                  <p className="font-semibold">{user.username}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-600 font-bold">✉</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 font-bold">🏢</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="font-semibold">{user.company_name}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-semibold capitalize">{user.role}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize mt-1">
                  {user.status}
                </span>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="bg-white p-6 rounded-lg shadow border lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Order Management</h2>
            <p className="text-sm text-gray-600 mb-4">Change the status of orders or checkout to confirm them. Confirmed orders cannot be modified.</p>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-400 text-2xl">📦</span>
                </div>
                <p className="text-lg font-medium">There are no orders</p>
                <p className="text-sm text-gray-500">Orders will appear here when available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/orders/${order.id}`)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-bold">📦</span>
                        </div>
                        <div>
                          <p className="font-semibold">Order #{order.id}</p>
                          <p className="text-sm text-gray-500">{order.createdAt || "Fecha no disponible"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          ${Number(order.totalAmount).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      {getStatusBadge(order.status)}

                      <div className="flex gap-2">
                        {order.status && order.status.toUpperCase() !== "CONFIRMED" && order.status.toUpperCase() !== "CANCELED" && order.status.toUpperCase() !== "CANCELLED" && (
                          <>
                            <select
                              onChange={(e) => handleUpdate(order.id, e.target.value)}
                              disabled={updatingOrder === order.id}
                              className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
                              defaultValue=""
                            >
                              <option value="" disabled>Cambiar Estado</option>
                              <option value="CANCELLED">Cancelado</option>
                            </select>
                            <button
                              onClick={() => router.push(`/orders/checkout?orderId=${order.id}`)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                              Checkout
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Pagination */}
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1">Page {currentPage}</span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={orders.length < 10}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
