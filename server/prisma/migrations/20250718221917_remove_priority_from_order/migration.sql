/*
  Warnings:

  - You are about to drop the column `priority` on the `Order` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "totalValue" REAL NOT NULL,
    "customerName" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "assignedTo" TEXT NOT NULL,
    "validDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Order" ("assignedTo", "createdAt", "customerName", "id", "orderNumber", "productId", "productType", "quantity", "status", "totalValue", "updatedAt", "validDate") SELECT "assignedTo", "createdAt", "customerName", "id", "orderNumber", "productId", "productType", "quantity", "status", "totalValue", "updatedAt", "validDate" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
