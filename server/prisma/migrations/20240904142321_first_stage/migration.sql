/*
  Warnings:

  - You are about to drop the column `address` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `profileImage` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `profilePictureUrl` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Playlist` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `StreamingHistory` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionLevel` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `UserFavorite` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Collaboration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Follow` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PlaylistTrack` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `StreamingHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UserFavorite` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Listener" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subscriptionLevel" TEXT NOT NULL DEFAULT 'FREE',
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Listener_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Artist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "biography" TEXT,
    "socialMediaLinks" TEXT,
    "genre" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Artist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Artist" ("biography", "createdAt", "genre", "id", "socialMediaLinks", "updatedAt") SELECT "biography", "createdAt", "genre", "id", "socialMediaLinks", "updatedAt" FROM "Artist";
DROP TABLE "Artist";
ALTER TABLE "new_Artist" RENAME TO "Artist";
CREATE UNIQUE INDEX "Artist_userId_key" ON "Artist"("userId");
CREATE TABLE "new_Collaboration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MAIN_ARTIST',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Collaboration_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Collaboration_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Collaboration" ("artistId", "id", "role", "trackId") SELECT "artistId", "id", "role", "trackId" FROM "Collaboration";
DROP TABLE "Collaboration";
ALTER TABLE "new_Collaboration" RENAME TO "Collaboration";
CREATE UNIQUE INDEX "Collaboration_trackId_artistId_key" ON "Collaboration"("trackId", "artistId");
CREATE TABLE "new_Follow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "followerId" TEXT NOT NULL,
    "followingArtistId" TEXT NOT NULL,
    "followedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Follow_followingArtistId_fkey" FOREIGN KEY ("followingArtistId") REFERENCES "Artist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "Listener" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Follow" ("followedAt", "followerId", "followingArtistId", "id") SELECT "followedAt", "followerId", "followingArtistId", "id" FROM "Follow";
DROP TABLE "Follow";
ALTER TABLE "new_Follow" RENAME TO "Follow";
CREATE UNIQUE INDEX "Follow_followerId_followingArtistId_key" ON "Follow"("followerId", "followingArtistId");
CREATE TABLE "new_Playlist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverImageUrl" TEXT,
    "public" BOOLEAN NOT NULL DEFAULT true,
    "listenerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Playlist_listenerId_fkey" FOREIGN KEY ("listenerId") REFERENCES "Listener" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Playlist" ("coverImageUrl", "createdAt", "description", "id", "public", "title", "updatedAt") SELECT "coverImageUrl", "createdAt", "description", "id", "public", "title", "updatedAt" FROM "Playlist";
DROP TABLE "Playlist";
ALTER TABLE "new_Playlist" RENAME TO "Playlist";
CREATE TABLE "new_PlaylistTrack" (
    "playlistId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("playlistId", "trackId"),
    CONSTRAINT "PlaylistTrack_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlaylistTrack_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PlaylistTrack" ("addedAt", "playlistId", "trackId") SELECT "addedAt", "playlistId", "trackId" FROM "PlaylistTrack";
DROP TABLE "PlaylistTrack";
ALTER TABLE "new_PlaylistTrack" RENAME TO "PlaylistTrack";
CREATE TABLE "new_StreamingHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackId" TEXT NOT NULL,
    "streamedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "device" TEXT NOT NULL DEFAULT 'WEB',
    "location" TEXT,
    "listenerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StreamingHistory_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StreamingHistory_listenerId_fkey" FOREIGN KEY ("listenerId") REFERENCES "Listener" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_StreamingHistory" ("device", "id", "location", "streamedAt", "trackId") SELECT "device", "id", "location", "streamedAt", "trackId" FROM "StreamingHistory";
DROP TABLE "StreamingHistory";
ALTER TABLE "new_StreamingHistory" RENAME TO "StreamingHistory";
CREATE TABLE "new_Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "subscriptionLevel" TEXT NOT NULL DEFAULT 'FREE',
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "paymentMethod" TEXT NOT NULL DEFAULT 'CTSI',
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "listenerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_listenerId_fkey" FOREIGN KEY ("listenerId") REFERENCES "Listener" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Subscription" ("autoRenew", "endDate", "id", "paymentMethod", "startDate", "subscriptionLevel", "userId") SELECT "autoRenew", "endDate", "id", "paymentMethod", "startDate", "subscriptionLevel", "userId" FROM "Subscription";
DROP TABLE "Subscription";
ALTER TABLE "new_Subscription" RENAME TO "Subscription";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "profileImage" TEXT NOT NULL,
    "country" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("country", "createdAt", "displayName", "id", "name", "profileImage", "updatedAt", "username") SELECT "country", "createdAt", "displayName", "id", "name", "profileImage", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_address_key" ON "User"("address");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE TABLE "new_UserFavorite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "favoriteType" TEXT NOT NULL DEFAULT 'TRACK',
    "itemId" TEXT NOT NULL,
    "listenerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserFavorite_listenerId_fkey" FOREIGN KEY ("listenerId") REFERENCES "Listener" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_UserFavorite" ("createdAt", "favoriteType", "id", "itemId") SELECT "createdAt", "favoriteType", "id", "itemId" FROM "UserFavorite";
DROP TABLE "UserFavorite";
ALTER TABLE "new_UserFavorite" RENAME TO "UserFavorite";
CREATE UNIQUE INDEX "UserFavorite_listenerId_itemId_key" ON "UserFavorite"("listenerId", "itemId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Listener_userId_key" ON "Listener"("userId");
