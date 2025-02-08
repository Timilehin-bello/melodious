/*
  Warnings:

  - Added the required column `bufferingTime` to the `StreamingHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `completionRate` to the `StreamingHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deviceInfo` to the `StreamingHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skipCount` to the `StreamingHistory` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "PlaybackQuality" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "trackId" INTEGER NOT NULL,
    "listenerId" INTEGER NOT NULL,
    "bufferingEvents" INTEGER NOT NULL,
    "averageBufferSize" REAL NOT NULL,
    "networkQuality" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlaybackQuality_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlaybackQuality_listenerId_fkey" FOREIGN KEY ("listenerId") REFERENCES "Listener" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlaybackSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "trackId" INTEGER NOT NULL,
    "listenerId" INTEGER NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
    "deviceInfo" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlaybackSession_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlaybackSession_listenerId_fkey" FOREIGN KEY ("listenerId") REFERENCES "Listener" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StreamingHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bufferingTime" DATETIME NOT NULL,
    "skipCount" INTEGER NOT NULL,
    "completionRate" INTEGER NOT NULL,
    "trackId" INTEGER NOT NULL,
    "streamedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceInfo" TEXT NOT NULL,
    "listenerId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StreamingHistory_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StreamingHistory_listenerId_fkey" FOREIGN KEY ("listenerId") REFERENCES "Listener" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StreamingHistory" ("createdAt", "id", "listenerId", "streamedAt", "trackId", "updatedAt") SELECT "createdAt", "id", "listenerId", "streamedAt", "trackId", "updatedAt" FROM "StreamingHistory";
DROP TABLE "StreamingHistory";
ALTER TABLE "new_StreamingHistory" RENAME TO "StreamingHistory";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "PlaybackQuality_trackId_timestamp_idx" ON "PlaybackQuality"("trackId", "timestamp");

-- CreateIndex
CREATE INDEX "PlaybackQuality_listenerId_timestamp_idx" ON "PlaybackQuality"("listenerId", "timestamp");

-- CreateIndex
CREATE INDEX "PlaybackSession_trackId_startTime_idx" ON "PlaybackSession"("trackId", "startTime");

-- CreateIndex
CREATE INDEX "PlaybackSession_listenerId_startTime_idx" ON "PlaybackSession"("listenerId", "startTime");
