-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "Ad" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdPlay" (
    "id" SERIAL NOT NULL,
    "adId" INTEGER NOT NULL,
    "listenerId" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "playedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdPlay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdPlay_listenerId_playedAt_idx" ON "AdPlay"("listenerId", "playedAt");

-- CreateIndex
CREATE INDEX "AdPlay_adId_playedAt_idx" ON "AdPlay"("adId", "playedAt");

-- AddForeignKey
ALTER TABLE "AdPlay" ADD CONSTRAINT "AdPlay_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Ad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdPlay" ADD CONSTRAINT "AdPlay_listenerId_fkey" FOREIGN KEY ("listenerId") REFERENCES "Listener"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
