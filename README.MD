# 🚀 OrderFlow SaaS

**OrderFlow** is a **microservices-based SaaS platform** designed to manage business operations such as **orders, payments, users, and authentication**, with a strong focus on **backend architecture, scalability, and security**.

This project is built as a **real-world backend system**, not a simple CRUD demo.

---

## 🧠 Architecture Overview

- API Gateway as a single entry point
- Independent microservices with clear responsibilities
- Event-driven communication using RabbitMQ
- Stateless authentication using JWT
- Asynchronous email notifications
- Designed with scalability and production patterns in mind

---

## 🛠 Tech Stack

### Backend
- **NestJS**
- **Prisma ORM**
- **PostgreSQL**
- **RabbitMQ**
- **JWT Authentication**
- **Nodemailer (Transactional Emails)**

### Frontend
- **Next.js (App Router)**
- **Tailwind CSS**

### Infrastructure
- **Docker**
---

## 📦 Microservices

| Service | Responsibility |
|-------|----------------|
| API Gateway | Single entry point, routing, auth guards |
| Auth Service | Authentication, JWT issuance |
| Users Service | User profiles and roles |
| Orders Service | Orders, items, order lifecycle |
| Payments Service | Checkout and payment processing |
| Notifications Service | Security and transactional emails |

---

## 🔄 Core Features

### 🔐 Authentication & Security
- User registration and login
- JWT-based authentication (HttpOnly cookies)
- Role-based authorization
- Login security alert emails including:
  - IP address
  - Timestamp
  - Device information
- Non-blocking authentication flow (emails are async)

---

### 📦 Orders Management
- Create orders with multiple items
- Order lifecycle states:
  - `CREATED`
  - `CHECKOUT`
  - `PAID`
  - `FAILED`
- Server-side total calculation (trusted backend logic)
- Order ownership and assignment

---

### 💳 Payments & Checkout
- Checkout flow initiated from Orders Service
- Orders emit checkout events
- Payments Service processes payments asynchronously
- Payment status updates propagate back to Orders
- Orders are finalized only after successful payment

---

### ✉️ Email Notifications
- Registration confirmation emails
- Login security alert emails
- Emails sent asynchronously using events
- Email failures do not affect core business logic

---

## 🔄 Event-Driven Communication

Services communicate using **RabbitMQ**, following these principles:

- Domain events instead of direct coupling
- Clear separation of responsibilities
- No synchronous dependencies between services
- Prepared for future scalability (queues, retries, acknowledgments)

---

## 📐 System Architecture Diagram

![System Architecture](architecture/system-diagram.png)

---

## ▶️ Run Locally

```bash
docker-compose up --build
