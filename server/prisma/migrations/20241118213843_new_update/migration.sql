/*
  Warnings:

  - You are about to drop the `Album` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Collaboration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Greeting` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Playlist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlaylistTrack` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subscription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserActivity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CategoryAlbums` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CategoryArtists` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CategoryTracks` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `Artist` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `biography` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `genre` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `listeningTime` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `socialMediaLinks` on the `Artist` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `Artist` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `userId` on the `Artist` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `Follow` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `followerId` on the `Follow` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `followingArtistId` on the `Follow` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `id` on the `Follow` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `Listener` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Listener` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `userId` on the `Listener` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `StreamingHistory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `device` on the `StreamingHistory` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `StreamingHistory` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `StreamingHistory` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `listenerId` on the `StreamingHistory` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `trackId` on the `StreamingHistory` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `Token` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Token` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `userId` on the `Token` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `Track` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `albumId` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `audioFileUrl` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `explicit` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `isrcCode` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `lyrics` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `popularity` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `trackNumber` on the `Track` table. All the data in the column will be lost.
  - You are about to alter the column `artistId` on the `Track` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `id` on the `Track` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `country` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `displayName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profileImage` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `User` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `UserFavorite` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `UserFavorite` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `listenerId` on the `UserFavorite` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - Made the column `artistId` on table `Track` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Category_name_key";

-- DropIndex
DROP INDEX "Collaboration_trackId_artistId_key";

-- DropIndex
DROP INDEX "_CategoryAlbums_B_index";

-- DropIndex
DROP INDEX "_CategoryAlbums_AB_unique";

-- DropIndex
DROP INDEX "_CategoryArtists_B_index";

-- DropIndex
DROP INDEX "_CategoryArtists_AB_unique";

-- DropIndex
DROP INDEX "_CategoryTracks_B_index";

-- DropIndex
DROP INDEX "_CategoryTracks_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Album";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Category";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Collaboration";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Greeting";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Playlist";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PlaylistTrack";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Subscription";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UserActivity";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_CategoryAlbums";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_CategoryArtists";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_CategoryTracks";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ListeningTime" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "trackId" INTEGER NOT NULL,
    "artistId" INTEGER NOT NULL,
    "totalListeningTime" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ListeningTime_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ListeningTime_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Artist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Artist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
    CONSTRAINT "Follow_followingArtistId_fkey" FOREIGN KEY ("followingArtistId") REFERENCES "Artist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "Listener" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
    CONSTRAINT "Listener_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
    CONSTRAINT "StreamingHistory_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StreamingHistory_listenerId_fkey" FOREIGN KEY ("listenerId") REFERENCES "Listener" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_StreamingHistory" ("createdAt", "id", "listenerId", "streamedAt", "trackId", "updatedAt") SELECT "createdAt", "id", "listenerId", "streamedAt", "trackId", "updatedAt" FROM "StreamingHistory";
DROP TABLE "StreamingHistory";
ALTER TABLE "new_StreamingHistory" RENAME TO "StreamingHistory";
CREATE TABLE "new_Token" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "token" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expires" DATETIME,
    "userId" INTEGER NOT NULL,
    "blacklisted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Token" ("blacklisted", "createdAt", "expires", "id", "token", "type", "updatedAt", "userId") SELECT "blacklisted", "createdAt", "expires", "id", "token", "type", "updatedAt", "userId" FROM "Token";
DROP TABLE "Token";
ALTER TABLE "new_Token" RENAME TO "Token";
CREATE TABLE "new_Track" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "listenTime" INTEGER,
    "artistId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Track_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Track" ("artistId", "createdAt", "id", "title", "updatedAt") SELECT "artistId", "createdAt", "id", "title", "updatedAt" FROM "Track";
DROP TABLE "Track";
ALTER TABLE "new_Track" RENAME TO "Track";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "walletAddress" TEXT NOT NULL,
    "lastLogin" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "id", "lastLogin", "updatedAt", "walletAddress") SELECT "createdAt", "id", "lastLogin", "updatedAt", "walletAddress" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");
CREATE TABLE "new_UserFavorite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "favoriteType" TEXT NOT NULL DEFAULT 'TRACK',
    "itemId" TEXT NOT NULL,
    "listenerId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserFavorite_listenerId_fkey" FOREIGN KEY ("listenerId") REFERENCES "Listener" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_UserFavorite" ("createdAt", "favoriteType", "id", "itemId", "listenerId", "updatedAt") SELECT "createdAt", "favoriteType", "id", "itemId", "listenerId", "updatedAt" FROM "UserFavorite";
DROP TABLE "UserFavorite";
ALTER TABLE "new_UserFavorite" RENAME TO "UserFavorite";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ListeningTime_trackId_artistId_key" ON "ListeningTime"("trackId", "artistId");
