/*
  Warnings:

  - You are about to drop the column `walletAddress` on the `Artist` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Artist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listeningTime" INTEGER,
    "biography" TEXT,
    "socialMediaLinks" TEXT,
    "genre" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Artist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Artist" ("biography", "createdAt", "genre", "id", "listeningTime", "socialMediaLinks", "updatedAt", "userId") SELECT "biography", "createdAt", "genre", "id", "listeningTime", "socialMediaLinks", "updatedAt", "userId" FROM "Artist";
DROP TABLE "Artist";
ALTER TABLE "new_Artist" RENAME TO "Artist";
CREATE UNIQUE INDEX "Artist_userId_key" ON "Artist"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
