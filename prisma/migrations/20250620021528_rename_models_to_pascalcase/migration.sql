/*
  Warnings:

  - You are about to drop the `article_comments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `articles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_comments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "article_comments" DROP CONSTRAINT "article_comments_articlesId_fkey";

-- DropForeignKey
ALTER TABLE "article_comments" DROP CONSTRAINT "article_comments_usersId_fkey";

-- DropForeignKey
ALTER TABLE "articles" DROP CONSTRAINT "articles_usersId_fkey";

-- DropForeignKey
ALTER TABLE "product_comments" DROP CONSTRAINT "product_comments_productsId_fkey";

-- DropForeignKey
ALTER TABLE "product_comments" DROP CONSTRAINT "product_comments_usersId_fkey";

-- DropTable
DROP TABLE "article_comments";

-- DropTable
DROP TABLE "articles";

-- DropTable
DROP TABLE "product_comments";

-- CreateTable
CREATE TABLE "Articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "usersId" TEXT NOT NULL,

    CONSTRAINT "Articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product_comments" (
    "id" TEXT NOT NULL,
    "usersId" TEXT,
    "productsId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article_comments" (
    "id" TEXT NOT NULL,
    "usersId" TEXT,
    "articlesId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Articles_title_idx" ON "Articles"("title");

-- CreateIndex
CREATE INDEX "Articles_content_idx" ON "Articles"("content");

-- CreateIndex
CREATE INDEX "Product_comments_productsId_idx" ON "Product_comments"("productsId");

-- CreateIndex
CREATE INDEX "Product_comments_usersId_idx" ON "Product_comments"("usersId");

-- CreateIndex
CREATE INDEX "Article_comments_articlesId_idx" ON "Article_comments"("articlesId");

-- CreateIndex
CREATE INDEX "Article_comments_usersId_idx" ON "Article_comments"("usersId");

-- AddForeignKey
ALTER TABLE "Articles" ADD CONSTRAINT "Articles_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product_comments" ADD CONSTRAINT "Product_comments_productsId_fkey" FOREIGN KEY ("productsId") REFERENCES "Products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product_comments" ADD CONSTRAINT "Product_comments_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article_comments" ADD CONSTRAINT "Article_comments_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article_comments" ADD CONSTRAINT "Article_comments_articlesId_fkey" FOREIGN KEY ("articlesId") REFERENCES "Articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
