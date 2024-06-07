/*
  Warnings:

  - You are about to drop the `Pokedex` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Pokedex" DROP CONSTRAINT "Pokedex_authorId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "links" JSONB,
ADD COLUMN     "location" JSONB,
ADD COLUMN     "summary" TEXT;

-- DropTable
DROP TABLE "Pokedex";

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bodyMarkdown" TEXT NOT NULL,
    "published" BOOLEAN DEFAULT false,
    "mainImage" TEXT,
    "canonicalUrl" TEXT,
    "description" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
