export async function register(data: { username: string; password: string; email: string; company_name: string }) {
  const res = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Error en registro");
  }

  return res.json();
}

export async function logout() {
  const res = await fetch("http://localhost:3000/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Error en logout");
  }

  return res.json();
}

// src/lib/api.ts
export async function getMe() {
  const res = await fetch("http://localhost:3000/api/users/profile", {
    credentials: "include",
  })
  console.log(res.body)

  if (!res.ok) throw new Error("No autenticado")
  return res.json()
}



const API_URL = "http://localhost:3000/api";

async function request(
  url: string,
  options: RequestInit = {}
) {
  const res = await fetch(`${API_URL}${url}`, {
    credentials: "include", // cookies (JWT)
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Error en la petición");
  }

  return res.json();
}

export async function login(username: string, password: string) {
  const res = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // 🔑 NECESARIO PARA COOKIE
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error("Credenciales inválidas");
  }

  return res.json();
}


/* ---------- ORDERS ---------- */

export function createOrder(data: unknown) {
  return request(`/orders/create`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function checkoutOrder(data: { orderId: number; quantity: number }) {
  return request(`/orders/checkout/${data.orderId}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateOrder(orderId: number, status: string) {
  return request(`/orders/${orderId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function getMyOrders(limit = 10, page = 1, dateFilter?: { startDate?: string; endDate?: string }) {
  const params = new URLSearchParams({
    limit: limit.toString(),
    page: page.toString(),
  });

  if (dateFilter?.startDate) {
    params.append('startDate', dateFilter.startDate);
  }
  if (dateFilter?.endDate) {
    params.append('endDate', dateFilter.endDate);
  }

  return request(`/orders?${params.toString()}`);
}

export function getOrder(id: number) {
  return request(`/orders/${id}`);
}

export function sendNotification(data: unknown) {
  return request(`/notifications/send`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}