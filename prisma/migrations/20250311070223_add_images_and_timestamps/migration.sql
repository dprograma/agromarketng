/*
  Warnings:

  - Added the required column `updatedAt` to the `Ad` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `price` on the `Ad` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `price` on the `SubscriptionPlan` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Ad" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "price",
ADD COLUMN     "price" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "SubscriptionPlan" DROP COLUMN "price",
ADD COLUMN     "price" DECIMAL(10,2) NOT NULL;
