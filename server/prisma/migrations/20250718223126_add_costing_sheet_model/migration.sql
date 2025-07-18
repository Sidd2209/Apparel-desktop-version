-- CreateTable
CREATE TABLE "CostingSheet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "profitMargin" REAL NOT NULL,
    "selectedCurrency" TEXT NOT NULL,
    "costBreakdown" TEXT NOT NULL,
    "taxConfig" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
