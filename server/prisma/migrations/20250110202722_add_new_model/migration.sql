/*
  Warnings:

  - Added the required column `duration` to the `Track` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "deviceInfo" TEXT;

-- CreateTable
CREATE TABLE "ListeningSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "listenerId" INTEGER NOT NULL,
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    "totalDuration" INTEGER NOT NULL DEFAULT 0,
    "pauseCount" INTEGER NOT NULL DEFAULT 0,
    "bufferingTime" INTEGER NOT NULL DEFAULT 0,
    "skipCount" INTEGER NOT NULL DEFAULT 0,
    "deviceInfo" TEXT NOT NULL,
    "completionRate" REAL,
    "quality" TEXT,
    "networkMetrics" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ListeningSession_listenerId_fkey" FOREIGN KEY ("listenerId") REFERENCES "Listener" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrackMetrics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "trackId" INTEGER NOT NULL,
    "totalPlays" INTEGER NOT NULL DEFAULT 0,
    "uniqueListeners" INTEGER NOT NULL DEFAULT 0,
    "averageCompletionRate" REAL NOT NULL DEFAULT 0,
    "skipRate" REAL NOT NULL DEFAULT 0,
    "bufferingRate" REAL NOT NULL DEFAULT 0,
    "popularityScore" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TrackMetrics_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ArtistMetrics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "artistId" INTEGER NOT NULL,
    "totalPlays" INTEGER NOT NULL DEFAULT 0,
    "uniqueListeners" INTEGER NOT NULL DEFAULT 0,
    "followerCount" INTEGER NOT NULL DEFAULT 0,
    "engagementRate" REAL NOT NULL DEFAULT 0,
    "popularityScore" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ArtistMetrics_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ListenerMetrics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "listenerId" INTEGER NOT NULL,
    "totalListeningTime" INTEGER NOT NULL DEFAULT 0,
    "favoriteGenres" TEXT,
    "listeningPatterns" TEXT,
    "engagementScore" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ListenerMetrics_listenerId_fkey" FOREIGN KEY ("listenerId") REFERENCES "Listener" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserMetrics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "lastActive" DATETIME,
    "sessionCount" INTEGER NOT NULL DEFAULT 0,
    "deviceTypes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserMetrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrackAnalytics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "trackId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "plays" INTEGER NOT NULL DEFAULT 0,
    "uniquePlays" INTEGER NOT NULL DEFAULT 0,
    "skipCount" INTEGER NOT NULL DEFAULT 0,
    "completions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TrackAnalytics_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ArtistAnalytics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "artistId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "plays" INTEGER NOT NULL DEFAULT 0,
    "uniqueListeners" INTEGER NOT NULL DEFAULT 0,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ArtistAnalytics_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "listenerId" INTEGER NOT NULL,
    "trackId" INTEGER NOT NULL,
    "score" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Recommendation_listenerId_fkey" FOREIGN KEY ("listenerId") REFERENCES "Listener" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GeoLocation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT,
    "city" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GeoLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Playlist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "listenerId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Playlist_listenerId_fkey" FOREIGN KEY ("listenerId") REFERENCES "Listener" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlaylistTrack" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playlistId" INTEGER NOT NULL,
    "trackId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlaylistTrack_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlaylistTrack_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ArtistGenre" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "artistId" INTEGER NOT NULL,
    "genre" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ArtistGenre_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrackGenre" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "trackId" INTEGER NOT NULL,
    "genre" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TrackGenre_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Artist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Artist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Artist" ("createdAt", "id", "updatedAt", "userId") SELECT "createdAt", "id", "updatedAt", "userId" FROM "Artist";
DROP TABLE "Artist";
ALTER TABLE "new_Artist" RENAME TO "Artist";
CREATE UNIQUE INDEX "Artist_userId_key" ON "Artist"("userId");
CREATE TABLE "new_Follow" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "followerId" INTEGER NOT NULL,
    "followingArtistId" INTEGER NOT NULL,
    "followedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Follow_followingArtistId_fkey" FOREIGN KEY ("followingArtistId") REFERENCES "Artist" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "Listener" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Follow" ("createdAt", "followedAt", "followerId", "followingArtistId", "id", "updatedAt") SELECT "createdAt", "followedAt", "followerId", "followingArtistId", "id", "updatedAt" FROM "Follow";
DROP TABLE "Follow";
ALTER TABLE "new_Follow" RENAME TO "Follow";
CREATE UNIQUE INDEX "Follow_followerId_followingArtistId_key" ON "Follow"("followerId", "followingArtistId");
CREATE TABLE "new_Listener" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subscriptionLevel" TEXT NOT NULL DEFAULT 'FREE',
    "userId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Listener_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Listener" ("createdAt", "id", "subscriptionLevel", "updatedAt", "userId") SELECT "createdAt", "id", "subscriptionLevel", "updatedAt", "userId" FROM "Listener";
DROP TABLE "Listener";
ALTER TABLE "new_Listener" RENAME TO "Listener";
CREATE UNIQUE INDEX "Listener_userId_key" ON "Listener"("userId");
CREATE TABLE "new_StreamingHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "trackId" INTEGER NOT NULL,
    "streamedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listenerId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StreamingHistory_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StreamingHistory_listenerId_fkey" FOREIGN KEY ("listenerId") REFERENCES "Listener" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StreamingHistory" ("createdAt", "id", "listenerId", "streamedAt", "trackId", "updatedAt") SELECT "createdAt", "id", "listenerId", "streamedAt", "trackId", "updatedAt" FROM "StreamingHistory";
DROP TABLE "StreamingHistory";
ALTER TABLE "new_StreamingHistory" RENAME TO "StreamingHistory";
CREATE TABLE "new_Track" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "listenTime" INTEGER NOT NULL DEFAULT 0,
    "artistId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL,
    CONSTRAINT "Track_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Track" ("artistId", "createdAt", "id", "listenTime", "title", "updatedAt") SELECT "artistId", "createdAt", "id", coalesce("listenTime", 0) AS "listenTime", "title", "updatedAt" FROM "Track";
DROP TABLE "Track";
ALTER TABLE "new_Track" RENAME TO "Track";
CREATE TABLE "new_UserFavorite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "favoriteType" TEXT NOT NULL DEFAULT 'TRACK',
    "itemId" TEXT NOT NULL,
    "listenerId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserFavorite_listenerId_fkey" FOREIGN KEY ("listenerId") REFERENCES "Listener" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserFavorite" ("createdAt", "favoriteType", "id", "itemId", "listenerId", "updatedAt") SELECT "createdAt", "favoriteType", "id", "itemId", "listenerId", "updatedAt" FROM "UserFavorite";
DROP TABLE "UserFavorite";
ALTER TABLE "new_UserFavorite" RENAME TO "UserFavorite";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "TrackMetrics_trackId_key" ON "TrackMetrics"("trackId");

-- CreateIndex
CREATE UNIQUE INDEX "ArtistMetrics_artistId_key" ON "ArtistMetrics"("artistId");

-- CreateIndex
CREATE UNIQUE INDEX "ListenerMetrics_listenerId_key" ON "ListenerMetrics"("listenerId");

-- CreateIndex
CREATE UNIQUE INDEX "UserMetrics_userId_key" ON "UserMetrics"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TrackAnalytics_trackId_date_key" ON "TrackAnalytics"("trackId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ArtistAnalytics_artistId_date_key" ON "ArtistAnalytics"("artistId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistTrack_playlistId_trackId_key" ON "PlaylistTrack"("playlistId", "trackId");

-- CreateIndex
CREATE UNIQUE INDEX "ArtistGenre_artistId_genre_key" ON "ArtistGenre"("artistId", "genre");

-- CreateIndex
CREATE UNIQUE INDEX "TrackGenre_trackId_genre_key" ON "TrackGenre"("trackId", "genre");
