"use client"

import { useEffect } from "react"

export default function HideNavClient() {
  useEffect(() => {
    document.body.classList.add("no-nav")
    return () => {
      document.body.classList.remove("no-nav")
    }
  }, [])

  return null
}
