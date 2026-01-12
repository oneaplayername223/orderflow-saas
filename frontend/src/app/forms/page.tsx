"use client"

import { useState } from "react"
import { createOrder } from "@/lib/api"

export default function CreateOrderForm() {
  const [items, setItems] = useState([
    { referenceName: "", description: "", quantity: 1, unitPrice: 0 },
  ])

  const totalAmount = items.reduce(
    (sum, i) => sum + i.quantity * i.unitPrice,
    0
  )

  const handleChange = (index: number, field: string, value: any) => {
    const copy = [...items]
    copy[index] = { ...copy[index], [field]: value }
    setItems(copy)
  }

  const addItem = () => {
    setItems([
      ...items,
      { referenceName: "", description: "", quantity: 1, unitPrice: 0 },
    ])
  }

  const submit = async (e: any) => {
    e.preventDefault()

    await createOrder({
      type: "SALE",
      totalAmount,
      assignedTo: 3,
      items,
    })

    alert("Order created")
  }

  return (
    <form onSubmit={submit} className="space-y-4 max-w-xl">
      <h2 className="text-xl font-bold">Create Order</h2>

      {items.map((item, i) => (
        <div key={i} className="border p-3 rounded space-y-2">
          <input
            placeholder="Reference"
            value={item.referenceName}
            onChange={(e) => handleChange(i, "referenceName", e.target.value)}
          />

          <input
            placeholder="Description"
            value={item.description}
            onChange={(e) => handleChange(i, "description", e.target.value)}
          />

          <input
            type="number"
            placeholder="Quantity"
            value={item.quantity}
            onChange={(e) =>
              handleChange(i, "quantity", Number(e.target.value))
            }
          />

          <input
            type="number"
            placeholder="Unit Price"
            value={item.unitPrice}
            onChange={(e) =>
              handleChange(i, "unitPrice", Number(e.target.value))
            }
          />
        </div>
      ))}

      <button type="button" onClick={addItem}>
        + Add Item
      </button>

      <div>
        <strong>Total:</strong> ${totalAmount.toFixed(2)}
      </div>

      <button type="submit">Create Order</button>
    </form>
  )
}
