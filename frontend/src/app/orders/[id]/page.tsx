"use client"

import { useState, useEffect } from "react"
import { getOrder, updateOrder } from "@/lib/api"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Package, Calendar, DollarSign, User, CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react"

export default function OrderDetailsPage() {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState("")
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  async function fetchOrder() {
    try {
      const data = await getOrder(Number(orderId))
      setOrder(data)
    } catch (err: any) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusUpdate(newStatus: string) {
    const confirmed = window.confirm(`¿You are sure you want to change the order status to "${newStatus.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}"?`)
    if (!confirmed) return

    setUpdating(true)
    setMessage("")
    try {
      await updateOrder(Number(orderId), newStatus)
      setOrder({ ...order, status: newStatus })
      setMessage("Status updated successfully")
    } catch (err: any) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setUpdating(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'created':
        return <Package className="w-5 h-5 text-blue-400" />
      case 'confirmed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-400" />
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />
      case 'canceled':
        return <XCircle className="w-5 h-5 text-red-400" />
      default:
        return <Package className="w-5 h-5 text-slate-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'created':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'confirmed':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'canceled':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Order not found</h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent mb-2">
            Order Details
          </h1>
          <p className="text-slate-400">Order ID: #{order.id}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Items */}
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Package className="w-6 h-6 text-violet-400" />
              Items
            </h2>

            <div className="space-y-4">
              {/* Mostrar items de la orden */}
              {order.items && order.items.length > 0 ? (
                order.items.map((item: any, index: number) => (
                  <div key={item.id} className="pb-4 border-b border-slate-700/50 last:border-b-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400">Product {index + 1}</span>
                      <span className="text-white font-semibold">{item.referenceName}</span>
                    </div>
                    {item.description && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-400">Description</span>
                        <span className="text-white font-semibold">{item.description}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400">Quantity</span>
                      <span className="text-white font-semibold">{item.quantity}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Unit Price</span>
                      <span className="text-white font-semibold">${Number(item.unitPrice).toFixed(2)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <span className="text-slate-400">There are no items in this order</span>
                </div>
              )}

              <div className="flex justify-between items-center pb-3 border-b border-slate-700/50">
                <span className="text-slate-400">Total</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  ${Number(order.totalAmount).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-slate-700/50">
                <span className="text-slate-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Created
                </span>
                <span className="text-white font-semibold">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Updated
                </span>
                <span className="text-white font-semibold">
                  {new Date(order.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Status and Actions */}
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              General Information
            </h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center pb-3 border-b border-slate-700/50">
                <span className="text-slate-400">Order Type</span>
                <span className="text-white font-semibold">{order.type}</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-slate-700/50">
                <span className="text-slate-400">Order ID</span>
                <span className="text-white font-semibold">#{order.id}</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-slate-700/50">
                <span className="text-slate-400">Company</span>
                <span className="text-white font-semibold">ID: {order.companyId}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Created by</span>
                <span className="text-white font-semibold">{order.createdBy}</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              Status and Actions
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Current Status</label>
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Change Status</label>
                {order.status?.toUpperCase() === 'CONFIRMED' || order.status?.toUpperCase() === 'CANCELED' ? (
                  <div className="text-sm text-slate-400 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                    {order.status?.toUpperCase() === 'CONFIRMED'
                      ? 'Las órdenes confirmadas no pueden cambiar su estado.'
                      : 'Las órdenes canceladas no pueden cambiar su estado.'
                    }
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {['IN_PROGRESS', 'CANCELED'].filter(status => 
                      status !== 'COMPLETED' || order.status !== 'CONFIRMED'
                    ).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(status)}
                        disabled={updating || order.status?.toUpperCase() === status}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          order.status?.toUpperCase() === status
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600'
                        }`}
                      >
                        {updating ? (
                          <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                        ) : null}
                        {status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {order.status?.toUpperCase() !== 'CONFIRMED' && order.status?.toUpperCase() !== 'CANCELED' && (
                <button
                  onClick={() => router.push(`/orders/checkout?orderId=${order.id}`)}
                  className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25"
                >
                  <DollarSign className="w-5 h-5" />
                  Go to Checkout
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mt-6 p-4 rounded-xl border ${
            message.includes("Error")
              ? "bg-red-500/10 border-red-500/30 text-red-400"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}