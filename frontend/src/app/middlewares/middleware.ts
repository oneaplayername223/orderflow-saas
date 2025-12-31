// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const tokenCookie = req.cookies.get("flowToken")
  const pathname = req.nextUrl.pathname

  // Protect dashboard, orders, profile, checkout and other private routes
  const protectedRoute = (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/payments") ||
    pathname.startsWith("/admin")
  )

  if (!protectedRoute) return NextResponse.next()

  if (!tokenCookie) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // tokenCookie.value may include a Bearer prefix or be a plain JWT
  const raw = tokenCookie.value?.startsWith("Bearer ") ? tokenCookie.value.replace("Bearer ", "") : tokenCookie.value

  // Helper to decode base64url
  const base64UrlToBase64 = (str: string) => {
    str = str.replace(/-/g, "+").replace(/_/g, "/")
    const pad = str.length % 4
    if (pad === 2) str += "=="
    else if (pad === 3) str += "="
    else if (pad === 1) str += "="
    return str
  }

  try {
    const parts = raw.split(".")
    if (parts.length !== 3) throw new Error("Invalid token")
    const payload = JSON.parse(atob(base64UrlToBase64(parts[1])))
    const exp = payload.exp
    if (typeof exp === "number") {
      // exp is in seconds
      if (exp * 1000 < Date.now()) {
        return NextResponse.redirect(new URL("/login", req.url))
      }
    }
  } catch (err) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}
