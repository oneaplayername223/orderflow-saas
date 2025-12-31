-- CreateEnum
CREATE TYPE "Curreny" AS ENUM ('DOP', 'USD');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "STRIPE" AS ENUM ('PAYPAL', 'MANUAL', 'MOCK');

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" "Curreny" NOT NULL DEFAULT 'DOP',
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "provider" "STRIPE" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);
