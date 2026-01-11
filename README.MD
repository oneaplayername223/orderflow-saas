# 🚀 OrderFlow SaaS

**OrderFlow** is an **enterprise-grade microservices-based SaaS platform** designed to manage complex business operations including **orders, payments, users, and authentication**, with a strong focus on **scalable backend architecture, production-ready security, and comprehensive testing**.

This project demonstrates a **real-world backend system** built following industry best practices and cloud-native patterns.

---

## 📋 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [Tech Stack](#-tech-stack)
- [Microservices](#-microservices)
- [Core Features](#-core-features)
- [Testing](#-testing)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Security](#-security)
- [Documentation](#-documentation)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🧠 Architecture Overview

<<<<<<< HEAD
=======
![Architecture](./architecture/system-diagram.png)

>>>>>>> bbba8a236d99b83990d4d0f7003a3cf343944644
OrderFlow follows a **distributed microservices architecture** with the following design principles:

- **API Gateway Pattern:** Single entry point for all client requests with routing and centralized authentication
- **Service Independence:** Each microservice owns its data and business logic
- **Event-Driven Communication:** Asynchronous message-based communication via RabbitMQ
- **Stateless Services:** All services are horizontally scalable with no shared session state
- **JWT-Based Authentication:** Secure, stateless user authentication with HttpOnly cookies
- **Database per Service:** Each microservice maintains its own isolated database
- **Resilience:** Built-in error handling, retries, and graceful degradation

---

## 🛠 Tech Stack

### Backend Framework
- **NestJS 11.0.1** - Progressive TypeScript framework for scalable applications
- **Node.js 18+** - JavaScript runtime

### Database & ORM
- **PostgreSQL 15+** - Primary relational database
- **Prisma 5.22.0** - Type-safe ORM with migrations and introspection

### Message Queue & Events
- **RabbitMQ 3.12+** - Distributed message broker for inter-service communication
- **@nestjs/microservices** - NestJS microservices module

### Authentication & Security
- **jsonwebtoken 9.0.3** - JWT token generation and validation
- **bcrypt 6.0.0** - Password hashing and verification
- **@nestjs/passport** - Authentication middleware

### Email & Notifications
- **Nodemailer 6.9.0** - Email transport layer
- **SMTP Services** - Gmail, SendGrid, or custom SMTP

### Testing
- **Jest 29.7.0** - Testing framework with 143+ unit and integration tests
- **@nestjs/testing** - NestJS testing utilities
- **100% Type Coverage** - TypeScript for compile-time safety

### Frontend
- **Next.js 14.0.0** - React framework with App Router
- **TailwindCSS** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript

### Infrastructure & DevOps
- **Docker 24.0+** - Containerization
- **Docker Compose** - Multi-container orchestration
- **GitHub/GitLab** - Source control (ready for CI/CD)

---

## 📦 Microservices

| Service | Responsibility | Port |
|---------|----------------|------|
| API Gateway | Single entry point, routing, auth guards | 3000 |
| Auth Service | Authentication, JWT issuance | 3001 |
| Users Service | User profiles and roles | 3002 |
| Orders Service | Orders, items, order lifecycle | 3003 |
| Payments Service | Checkout and payment processing | 3004 |
| Notifications Service | Security and transactional emails | 3005 |

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

### 📦 Orders Management
- Create orders with multiple items
- Order lifecycle states: `CREATED`, `CHECKOUT`, `PAID`, `FAILED`
- Server-side total calculation (trusted backend logic)
- Order ownership and assignment

### 💳 Payments & Checkout
- Checkout flow initiated from Orders Service
- Orders emit checkout events
- Payments Service processes payments asynchronously
- Payment status updates propagate back to Orders
- Orders are finalized only after successful payment

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

## 🔐 Security

### Authentication & Authorization
- **JWT Tokens:** Secure, stateless authentication tokens stored in HttpOnly cookies
- **Password Security:** Bcrypt hashing with configurable salt rounds
- **Role-Based Access Control (RBAC):** Fine-grained permission management
- **Auth Guards:** Implemented at controller and route levels
- **CORS:** Properly configured cross-origin resource sharing

### Data Protection
- **Encryption at Rest:** Database-level encryption
- **Encryption in Transit:** TLS/SSL for all external communications
- **Input Validation:** Request payload validation using DTOs and pipes
- **SQL Injection Prevention:** Prisma parameterized queries
- **Rate Limiting:** Optional rate limiting middleware for API Gateway

### Audit & Logging
- **Request Logging:** All API requests logged with timestamps and user context
- **Security Alerts:** Login notifications with IP and device information
- **Error Tracking:** Centralized error handling with proper logging

---

## 📊 Database Schema

### Entity Relationships

**Users Table**
- `id` (Primary Key)
- `accountId` (Foreign Key to Accounts)
- `email` (UNIQUE)
- `passwordHash`
- `role` (ADMIN, USER)
- `status` (ACTIVE, INACTIVE)
- `createdAt`, `updatedAt`

**Accounts Table**
- `id` (Primary Key)
- `companyName`
- `plan` (FREE, PRO, ENTERPRISE)
- `createdAt`, `updatedAt`

**Orders Table**
- `id` (Primary Key)
- `companyId` (Foreign Key)
- `createdBy` (Foreign Key to Users)
- `type` (PURCHASE, SALE)
- `status` (CREATED, CHECKOUT, PAID, FAILED)
- `totalAmount` (DECIMAL)
- `assignedTo` (Foreign Key to Users, optional)
- `createdAt`, `updatedAt`

**Order Items Table**
- `id` (Primary Key)
- `orderId` (Foreign Key to Orders)
- `referenceName`
- `description`
- `quantity`
- `unitPrice` (DECIMAL)
- `subtotal` (DECIMAL)

**Payments Table**
- `id` (Primary Key)
- `orderId` (Foreign Key to Orders)
- `companyId` (Foreign Key to Accounts)
- `amount` (DECIMAL)
- `currency`
- `status` (PAID, FAILED, PENDING)
- `provider` (MOCK, STRIPE, PAYPAL)
- `transactionId` (external reference)
- `createdAt`

---

## ✅ Testing

OrderFlow includes a **comprehensive test suite** with **143+ tests** across all microservices and the API Gateway, ensuring code reliability and maintainability.

### Test Coverage

| Service | Test Suites | Tests | Status |
|---------|------------|-------|--------|
| auth-service | 3 | 20 | ✅ PASS |
| users-service | 2 | 16 | ✅ PASS |
| orders-service | 3 | 29 | ✅ PASS |
| payments-service | 2 | 14 | ✅ PASS |
| notification-service | 2 | 28 | ✅ PASS |
| api-gateway | 5 | 36 | ✅ PASS |
| **TOTAL** | **17** | **143** | **✅ ALL PASS** |

### Test Types

**Unit Tests** - Service layer and business logic validation in isolation
**Integration Tests** - Module-level components, message patterns, and database transactions

### Test Quality Metrics

- **Coverage Target:** 80%+ across all services
- **Test Isolation:** Mocked external dependencies (Prisma, ClientProxy, RxJS)
- **Type Safety:** 100% TypeScript for compile-time validation
- **AAA Pattern:** Arrange-Act-Assert structure for readability
- **Best Practices:** NestJS testing guidelines and Jest conventions

---

## ▶️ Getting Started

### Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org)
- **Docker & Docker Compose** - [Download](https://www.docker.com)
- **Git** - [Download](https://git-scm.com)
- **PostgreSQL Client (optional)** - For direct database access

### Quick Start (Docker)

The fastest way to run the entire application:

```bash
# Clone the repository
git clone <repository-url>
cd OrderFlow-SaaS

# Start all services with Docker Compose
docker-compose up --build

# Services will be available at:
# - API Gateway: http://localhost:3000
# - Frontend: http://localhost:3001
# - RabbitMQ Management: http://localhost:15672 (guest:guest)
# - PostgreSQL: localhost:5432
```

### Development Setup (Local)

For development with hot-reload:

```bash
# Install dependencies for all services
npm install

# Set up environment variables
cp .env.example .env.local

# Start services (one terminal per service)

# Terminal 1: RabbitMQ (via Docker)
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3.12-management

# Terminal 2: PostgreSQL (via Docker)
docker run -d --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15

# Terminal 3: API Gateway
cd services/api-gateway
npm install
npm run start:dev

# Terminal 4: Auth Service
cd services/auth-service
npm install
npm run start:dev

# Terminal 5: Users Service
cd services/users-service
npm install
npm run start:dev

# Terminal 6: Orders Service
cd services/orders-service
npm install
npm run start:dev

# Terminal 7: Payments Service
cd services/payments-service
npm install
npm run start:dev

# Terminal 8: Notifications Service
cd services/notification-service
npm install
npm run start:dev

# Terminal 9: Frontend
cd frontend
npm install
npm run dev
```

### Database Setup

```bash
# Run migrations for each service
cd services/auth-service
npx prisma migrate dev

cd ../users-service
npx prisma migrate dev

cd ../orders-service
npx prisma migrate dev

cd ../payments-service
npx prisma migrate dev
```

---

## 📁 Project Structure

```
OrderFlow-SaaS/
├── services/                    # Microservices
│   ├── api-gateway/             # Main entry point
│   ├── auth-service/            # Authentication microservice
│   ├── users-service/           # User management microservice
│   ├── orders-service/          # Order management microservice
│   ├── payments-service/        # Payment processing microservice
│   └── notification-service/    # Email notifications microservice
├── frontend/                    # Next.js frontend application
├── docs/                        # Documentation
└── docker-compose.yml           # Multi-container orchestration
```

---

## 🔄 API Endpoints

### Authentication
```
POST   /auth/register          # Register new user
POST   /auth/login             # User login
POST   /auth/logout            # User logout
GET    /auth/profile           # Get current user profile
```

### Users
```
GET    /users/profile          # Get user profile
PATCH  /users/profile          # Update user profile
```

### Orders
```
POST   /orders/create          # Create new order
GET    /orders                 # List orders (paginated)
GET    /orders/:id             # Get order details
PATCH  /orders/:id             # Update order status
POST   /orders/:id/checkout    # Initiate checkout
```

### Payments
```
POST   /payments/checkout      # Process payment
GET    /payments/:id           # Get payment status
```

---

## 🔐 Environment Configuration

Create `.env.local` in the project root:

```env
# API Gateway
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRATION=24h

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/orderflow

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# Services
AUTH_SERVICE_PORT=3001
USERS_SERVICE_PORT=3002
ORDERS_SERVICE_PORT=3003
PAYMENTS_SERVICE_PORT=3004
NOTIFICATIONS_SERVICE_PORT=3005

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## 🚀 Deployment

### Production Checklist

- [ ] Set strong `JWT_SECRET` in environment
- [ ] Configure production PostgreSQL instance
- [ ] Set up RabbitMQ cluster for high availability
- [ ] Enable HTTPS/TLS for all services
- [ ] Configure proper CORS origins
- [ ] Set up monitoring and logging (e.g., ELK stack)
- [ ] Enable database backups
- [ ] Configure rate limiting and DDoS protection
- [ ] Set up CI/CD pipeline (GitHub Actions, GitLab CI)
- [ ] Run security audit and pen testing

### Docker Production Deployment

```bash
# Build all services
docker-compose -f docker-compose.yml build

# Run in production mode
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f
```

---

## 🔧 Development Workflow

### Running Tests

```bash
# Run all tests in a service
cd services/{service-name}
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch

# Run all tests at once
bash run-all-tests.sh
```

### Code Quality

```bash
# ESLint
npm run lint

# Format code
npm run format

# Build
npm run build
```

---

## 🐛 Troubleshooting

### Services Not Starting

```bash
# Check if ports are already in use
netstat -an | grep 3000

# Kill process using port (Unix/Linux/macOS)
kill -9 <PID>

# Or change port in .env.local
```

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -h localhost -U user -d orderflow

# Check database exists
psql -U user -c '\l'

# Reset migrations
npx prisma migrate reset --force
```

### RabbitMQ Issues

```bash
# Check RabbitMQ status
docker ps | grep rabbitmq

# View RabbitMQ logs
docker logs rabbitmq

# Access management console at http://localhost:15672
# Default credentials: guest:guest
```

### Microservice Communication

```bash
# View microservice logs
docker-compose logs auth-service
docker-compose logs orders-service

# Check service health
curl http://localhost:3000/health
```

---

## 📊 Performance & Monitoring

### Health Checks

All services expose health check endpoints:

```bash
GET /health           # Basic health status
GET /health/db        # Database connection status
GET /health/queue     # Message queue status
```

### Metrics

Services expose Prometheus metrics for monitoring:

```bash
GET /metrics          # Prometheus-compatible metrics
```

---

## 📚 Documentation

This project includes comprehensive documentation:

- **[TESTING_GUIDE.md](docs/TESTING_GUIDE.md)** - Complete guide for writing and running tests
- **[TESTS_FIXED.md](docs/TESTS_FIXED.md)** - Summary of all implemented tests (143 tests)
- **[TECHNICAL_CHANGES.md](docs/TECHNICAL_CHANGES.md)** - Technical implementation details

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

### Code Standards

- All code must be **TypeScript**
- Follow ESLint configuration
- Write tests for new features (minimum 80% coverage)
- Update documentation
- Use conventional commit messages

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Support & Contact

For issues, questions, or contributions:

- **GitHub Issues**: [Report bugs or request features](https://github.com/your-org/OrderFlow-SaaS/issues)
- **Documentation**: Check the [docs](docs/) folder
- **Email**: support@orderflow.local

---

## 🎯 Roadmap

### Phase 1 - ✅ Complete
- [x] Microservices architecture
- [x] User authentication & authorization
- [x] Order management system
- [x] Payment processing
- [x] Email notifications
- [x] Comprehensive testing (143 tests)
- [x] Professional documentation

### Phase 2 - Planned
- [ ] Advanced analytics dashboard
- [ ] Real-time order tracking
- [ ] Multi-tenant support
- [ ] Advanced payment methods (Apple Pay, Google Pay)
- [ ] Mobile application (React Native)
- [ ] Kubernetes deployment manifests

### Phase 3 - Future
- [ ] Machine learning recommendations
- [ ] Advanced reporting and insights
- [ ] API rate limiting per tier
- [ ] Webhook system for integrations
- [ ] GraphQL API support

---

## 📈 System Stats

| Metric | Value |
|--------|-------|
| **Total Tests** | 143 |
| **Test Suites** | 17 |
| **Code Coverage Target** | 80%+ |
| **Microservices** | 6 |
| **Database Tables** | 15+ |
| **API Endpoints** | 20+ |
| **Node Modules** | ~1000+ |
| **Lines of Code** | ~10,000+ |

---

## 🙏 Acknowledgments

Built with:
- [NestJS Community](https://nestjs.com)
- [Prisma Team](https://www.prisma.io)
- [TypeScript Community](https://www.typescriptlang.org)
- Open-source contributors

---

**Last Updated**: 2026
**Status**: Production Ready ✅
