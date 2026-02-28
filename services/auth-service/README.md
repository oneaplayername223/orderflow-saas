# Auth Service 🔐

Microservices for authentication and authorization in OrderFlow SaaS. Manages user registration, login, user profiles, and credential validation through JWT.

## Features

- ✅ User registration with validation
- ✅ Authentication via credentials
- ✅ JWT token generation and validation
- ✅ User status validation (ACTIVE/INACTIVE)
- ✅ Integration with notifications service (RabbitMQ)
- ✅ Integration with users service
- ✅ Integration with billing service
- ✅ Structured RPC error handling

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

# Copy and configure environment variables
cp .env.template .env

# Run Prisma migrations
npx prisma migrate dev

# Start development server
npm run start:dev
\\\

### Docker

\\\ash
# Start containers
docker-compose up --build

# Run migrations inside container
docker-compose exec server npx prisma migrate dev

# View logs
docker-compose logs -f server
\\\

## Environment Variables

Copy .env.template to .env and configure:

\\\env
# PostgreSQL Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/auth_db"

# RabbitMQ
RABBITMQ_URL="amqp://rabbitmq:5672"

# JWT Secret (required for production)
HASH_SECRET_KEY="your-secret-key-here"
\\\

## Testing

### Unit Tests

\\\ash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# With coverage
npm run test:cov
\\\

### E2E Tests

\\\ash
npm run test:e2e
\\\

## Available Scripts

\\\ash
npm run start:dev      # Development mode with nodemon
npm run build          # Build for production
npm run start:prod     # Run production build
npm run test           # Run unit tests
npm run test:cov       # Run tests with coverage
npm run test:e2e       # Run E2E tests
npm run lint           # Run ESLint with auto-fix
npm run format         # Format with Prettier
\\\

## Docker Compose

\\\ash
# Start service with database
docker-compose up --build

# Run database migrations
docker-compose exec server npx prisma migrate dev

# View database
docker-compose exec db psql -U postgres -d auth_db

# View logs
docker-compose logs -f server
docker-compose logs -f db
\\\

## API Reference

### Message Patterns

- **register** - Register new user
- **login** - Authenticate user and return JWT token
- **getProfile** - Get user profile information

## License

MIT
