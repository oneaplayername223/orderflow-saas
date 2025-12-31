// src/app/login/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { login } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault() // ⛔ BLOQUEA HTML

    try {
      const data = await login(username, password)
      router.push("/dashboard")
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-96 rounded-lg bg-white p-6 shadow"
      >
        <h1 className="mb-4 text-xl font-bold">Login</h1>

        <Input
          name="username"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-3"
        />

        <Input
          name="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4"
        />

        {error && <p className="mb-2 text-sm text-red-500">{error}</p>}

        <Button type="submit" className="w-full">
          Entrar
        </Button>
      </form>
    </div>
  )
}
