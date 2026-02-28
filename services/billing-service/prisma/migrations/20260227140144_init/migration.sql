-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('TRIAL', 'NORMAL', 'PRO', 'ENTERPRISE');

-- CreateTable
CREATE TABLE "Billing" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "accountType" "AccountType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expireAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Billing_pkey" PRIMARY KEY ("id")
);
