# Billing Service 💳

Microservice for billing and subscription management in OrderFlow SaaS. Manages subscription plans, charges, and billing status validation with support for multiple account tiers.

## Features

- ✅ Create and manage billing records
- ✅ Validate active subscriptions
- ✅ Support for multiple account types (TRIAL, NORMAL, PRO, ENTERPRISE)
- ✅ Automatic expiration date calculation
- ✅ RabbitMQ integration for microservices
- ✅ Production-ready tests (unit and E2E)
- ✅ Docker and Docker Compose configured

## Prerequisites

- Node.js 22.x
- Docker and Docker Compose
- PostgreSQL 15
- RabbitMQ

## Installation

### Local Setup

\\\ash
# Install dependencies
npm install

# Configure environment variables
cp .env.template .env

# Run Prisma migrations
npx prisma migrate dev

# Start development server
npm run start:dev
\\\

### Docker

\\\ash
# Create RabbitMQ network
docker network create rabbitmq-network

# Start containers
docker-compose up --build

# Run migrations
docker-compose exec server npx prisma migrate dev
\\\

## Environment Variables

Copy .env.template to .env:

\\\env
DATABASE_URL="postgresql://postgres:postgres@localhost:5437/billing_db"
RABBITMQ_URL="amqp://rabbitmq:5672"
PORT=6002
\\\

## Testing

### Unit Tests

\\\ash
npm run test          # Unit tests
npm run test:watch    # Watch mode
npm run test:cov      # With coverage
\\\

### E2E Tests

\\\ash
npm run test:e2e
\\\

## Available Scripts

\\\ash
npm run start:dev      # Development with watch
npm run build          # Build for production
npm run start:prod     # Run production build

npm run test           # Unit tests
npm run test:watch     # Watch mode
npm run test:cov       # With coverage
npm run test:e2e       # E2E tests

npm run lint           # ESLint with auto-fix
npm run format         # Prettier formatting
\\\

## Docker Commands

\\\ash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f server
docker-compose logs -f db

# Access database
docker-compose exec db psql -U postgres -d billing_db

# Run tests in container
docker-compose exec server npm run test
\\\

## Account Types

- **TRIAL** - Free trial plan (30 days)
- **NORMAL** - Standard plan
- **PRO** - Professional plan
- **ENTERPRISE** - Enterprise plan

## API Reference

### Message Patterns

- **create-billing** - Create a new billing record
- **get-billing** - Check subscription status

### DTOs

\\\	ypescript
// CreateBillingDto
{ accountId: number; amount?: number; accountType?: string }

// GetBillingDto
{ accountId: number; email: string }
\\\

## License

MIT
