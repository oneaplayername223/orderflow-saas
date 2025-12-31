-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "company_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);
