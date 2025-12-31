/*
  Warnings:

  - Added the required column `company_id` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "company_id" INTEGER NOT NULL;
