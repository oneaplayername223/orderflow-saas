"use client"

import { useEffect, useState } from "react"
import { getMe } from "@/lib/api"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    getMe().then(setUser)
  }, [])

  if (!user) return <p>Cargando...</p>

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Usuario: {user.username}</p>
      <p>Rol: {user.role}</p>
    </div>
  )
}
