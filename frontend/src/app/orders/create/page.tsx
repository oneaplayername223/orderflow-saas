"use client"

import { useState } from "react"
import { createOrder } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function CreateOrderPage() {
  const [referenceName, setReferenceName] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [unitPrice, setUnitPrice] = useState(0)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [createdOrder, setCreatedOrder] = useState<any>(null)
  const router = useRouter()

  async function handleSubmit() {
    if (!referenceName || quantity < 1 || unitPrice <= 0) {
      setMessage("Por favor completa todos los campos correctamente")
      return
    }

    setIsLoading(true)
    setMessage("")

    try {
      const totalAmount = quantity * unitPrice
      const payload = {
        type: "SALE",
        totalAmount,
        items: [
          {
            referenceName,
            quantity,
            unitPrice,
          },
        ],
      }

      const order = await createOrder(payload)
      setCreatedOrder(order)
      setMessage("Orden creada correctamente")
    } catch (err: any) {
      setMessage(err.message || "Error al crear la orden")
    } finally {
      setIsLoading(false)
    }
  }

  const totalAmount = quantity * unitPrice

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-600 hover:text-gray-800 p-2 rounded hover:bg-gray-100"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Order</h1>
            <p className="text-gray-600 mt-1">Complete the order details</p>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Order details</h2>
            <p className="text-gray-600">Enter product and quantity information</p>
          </div>
          <div className="space-y-6">
            {/* Product Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Product Name</label>
              <input
                type="text"
                placeholder="Ej: Laptop HP Pavilion"
                value={referenceName}
                onChange={(e) => setReferenceName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Unit Price */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Unit Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={unitPrice || ""}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Total Amount Display */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Total</span>
                <span className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-md transition-colors"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Creating Order...
                </>
              ) : (
                <>
                  Create Order
                </>
              )}
            </button>

            {/* Message */}
            {message && (
              <div
                className={`p-4 rounded-lg border ${
                  createdOrder
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-yellow-50 border-yellow-200 text-yellow-800"
                }`}
              >
                <p>{message}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Created Success Card */}
        {createdOrder && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-green-800">Order Created Successfully</h2>
            </div>
            <div className="space-y-4">
              {/* Order Summary */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg border">
                <div>
                  <p className="text-gray-600 text-sm">Order ID</p>
                  <p className="text-gray-900 font-semibold text-lg">#{createdOrder.id}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Total</p>
                  <p className="text-gray-900 font-semibold text-lg">${Number(createdOrder.totalAmount).toFixed(2)}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h3 className="text-gray-900 font-semibold">Products:</h3>
                {createdOrder.items.map((item: any, index: number) => (
                  <div key={index} className="p-3 bg-white rounded-lg border space-y-1">
                    <p className="text-gray-900 font-medium">{item.referenceName}</p>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Cantidad: {item.quantity}</span>
                      <span>Precio: ${Number(item.unitPrice).toFixed(2)}</span>
                      <span className="text-gray-900 font-semibold">Subtotal: ${Number(item.subtotal).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => router.push(`/orders/checkout?orderId=${createdOrder.id}`)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md"
                >
                  Go to Checkout
                </button>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-md"
                >
                  Go Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
