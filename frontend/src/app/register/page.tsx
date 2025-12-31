"use client";

import { useState } from "react";
import { register } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    company_name: "",
  });
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await register(form);
      setMessage("Registro exitoso. Redirigiendo a login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setMessage(err.message);
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Registro</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="border p-2 w-full"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
        <input
          className="border p-2 w-full"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="border p-2 w-full"
          placeholder="Company Name"
          value={form.company_name}
          onChange={(e) => setForm({ ...form, company_name: e.target.value })}
          required
        />
        <input
          className="border p-2 w-full"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 w-full">
          Registrarse
        </button>
      </form>
      {message && <p className="mt-3">{message}</p>}
    </div>
  );
}