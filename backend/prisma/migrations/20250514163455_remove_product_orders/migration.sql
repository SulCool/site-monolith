/*
  Warnings:

  - You are about to drop the column `productId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_productId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "productId",
DROP COLUMN "quantity",
DROP COLUMN "total",
ADD COLUMN     "concreteType" TEXT,
ADD COLUMN     "deliveryType" TEXT,
ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'NEW',
ADD COLUMN     "volume" DOUBLE PRECISION;
