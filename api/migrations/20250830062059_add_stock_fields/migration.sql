/*
  Warnings:

  - Added the required column `purchaseDate` to the `Stock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchasePrice` to the `Stock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shares` to the `Stock` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Stock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shares" REAL NOT NULL,
    "purchasePrice" REAL NOT NULL,
    "currentPrice" REAL NOT NULL,
    "purchaseDate" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Stock" ("currentPrice", "id", "name", "symbol", "updatedAt") SELECT "currentPrice", "id", "name", "symbol", "updatedAt" FROM "Stock";
DROP TABLE "Stock";
ALTER TABLE "new_Stock" RENAME TO "Stock";
CREATE UNIQUE INDEX "Stock_symbol_key" ON "Stock"("symbol");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
