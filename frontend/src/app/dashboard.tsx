"use client"

import { useEffect, useState } from "react"
import { getMe } from "@/lib/api"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    getMe().then(setUser)
  }, [])

  if (!user) return <p>Loading...</p>

  return (
    <div>
      <h1>Dashboard</h1>
      <p>User: {user.username}</p>
      <p>Role: {user.role}</p>
    </div>
  )
}
