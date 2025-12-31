import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { cookies } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OrderFlow SaaS",
  description: "Order management system",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let isAuth = false
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("flowToken")
    isAuth = !!token?.value
  } catch (e) {
    isAuth = false
  }
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="bg-blue-600 text-white p-4">
          <div className="container mx-auto flex justify-between">
            <Link href="/" className="font-bold text-xl">OrderFlow</Link>
            <div className="space-x-4">
              {!isAuth ? (
                <>
                  <Link href="/login">Login</Link>
                  <Link href="/register">Register</Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard">Dashboard</Link>
                  <Link href="/orders/create">Create Order</Link>
                  <Link href="/profile">Profile</Link>
                </>
              )}
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
