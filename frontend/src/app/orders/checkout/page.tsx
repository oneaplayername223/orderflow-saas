"use client"

import { useState, useEffect } from "react"
import { checkoutOrder, getOrder } from "@/lib/api"
import { useSearchParams, useRouter } from "next/navigation"
import { CreditCard, Package, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react"

export default function CheckoutPage() {
  const [orderId, setOrderId] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)
  const [checkoutData, setCheckoutData] = useState<any>(null)
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [loadingOrder, setLoadingOrder] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const orderIdParam = searchParams.get("orderId")
    if (orderIdParam) {
      setOrderId(orderIdParam)
      fetchOrderDetails(orderIdParam)
    }
  }, [searchParams])

  async function fetchOrderDetails(id: string) {
    setLoadingOrder(true)
    try {
      const details = await getOrder(Number(id))
      setOrderDetails(details)
    } catch (err) {
      console.error("Error fetching order details:", err)
    } finally {
      setLoadingOrder(false)
    }
  }

  async function handleCheckout() {
    if (!orderId || !orderDetails) {
      setMessage("Por favor espera a que se carguen los detalles de la orden")
      return
    }

    setIsLoading(true)
    setMessage("")

    try {
      const payload = {
        orderId: Number(orderId),
        quantity: totalQuantity,
      }

      const res = await checkoutOrder(payload)
      setCheckoutData(res)
      setCheckoutSuccess(true)
      setMessage("Pago procesado exitosamente")
    } catch (err: any) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const totalQuantity = orderDetails && orderDetails.items
    ? orderDetails.items.reduce((total, item) => total + Number(item.quantity), 0)
    : 0
  const estimatedTotal = orderDetails ? Number(orderDetails.totalAmount) : 0

  if (checkoutSuccess && checkoutData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-4 animate-pulse">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
                Pago Exitoso
              </h1>
              <p className="text-slate-400">Tu orden ha sido procesada correctamente</p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 space-y-4 border border-slate-700/30">
              <div className="flex justify-between items-center pb-3 border-b border-slate-700/50">
                <span className="text-slate-400">Order ID</span>
                <span className="font-mono text-violet-400 font-semibold">#{checkoutData.orderId}</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-slate-700/50">
                <span className="text-slate-400">Cantidad</span>
                <span className="text-white font-semibold">{checkoutData.quantity} unidades</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-slate-700/50">
                <span className="text-slate-400">Total Pagado</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  ${Number(checkoutData.totalPaid).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Estado</span>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium border border-emerald-500/30">
                  {checkoutData.status}
                </span>
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full mt-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent mb-2">
            Checkout
          </h1>
          <p className="text-slate-400">Completa tu pago de forma segura</p>
        </div>

        {/* Main Form */}
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
          <div className="space-y-6">
            {/* Order ID Display */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Package className="w-4 h-4 text-violet-400" />
                Order ID
              </label>
              <div className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white">
                #{orderId}
              </div>
            </div>

            {/* Product Information */}
            {orderDetails && orderDetails.items && orderDetails.items.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4 text-violet-400" />
                  Productos en la Orden
                </label>
                <div className="space-y-3">
                  {orderDetails.items.map((item: any, index: number) => (
                    <div key={item.id} className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-white font-semibold">{item.referenceName}</h4>
                          {item.description && (
                            <p className="text-slate-400 text-sm">{item.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">${Number(item.unitPrice).toFixed(2)}</p>
                          <p className="text-slate-400 text-sm">Cantidad: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-700/30">
                        <span className="text-slate-400 text-sm">Subtotal</span>
                        <span className="text-white font-semibold">${Number(item.subtotal).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total Summary */}
            {orderDetails ? (
              <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-white">Total a Pagar</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                    ${estimatedTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30">
                <div className="text-center text-slate-400">
                  Cargando detalles de la orden...
                </div>
              </div>
            )}

            {/* Payment Button */}
            <button
              onClick={handleCheckout}
              disabled={isLoading || !orderDetails}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold px-6 py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] disabled:cursor-not-allowed disabled:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Pagar ${estimatedTotal.toFixed(2)}
                </>
              )}
            </button>

            {/* Message */}
            {message && (
              <div
                className={`p-4 rounded-xl border ${
                  message.includes("Error")
                    ? "bg-red-500/10 border-red-500/30 text-red-400"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                }`}
              >
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>Pago seguro y encriptado</p>
        </div>
      </div>
    </div>
  )
}

