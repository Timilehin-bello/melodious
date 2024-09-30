/*
  Warnings:

  - Added the required column `walletAddress` to the `Artist` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Artist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletAddress" TEXT NOT NULL,
    "listeningTime" INTEGER,
    "biography" TEXT,
    "socialMediaLinks" TEXT,
    "genre" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Artist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Artist" ("biography", "createdAt", "genre", "id", "socialMediaLinks", "updatedAt", "userId") SELECT "biography", "createdAt", "genre", "id", "socialMediaLinks", "updatedAt", "userId" FROM "Artist";
DROP TABLE "Artist";
ALTER TABLE "new_Artist" RENAME TO "Artist";
CREATE UNIQUE INDEX "Artist_walletAddress_key" ON "Artist"("walletAddress");
CREATE UNIQUE INDEX "Artist_userId_key" ON "Artist"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
