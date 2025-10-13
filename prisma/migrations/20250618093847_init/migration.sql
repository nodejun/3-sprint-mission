-- CreateEnum
CREATE TYPE "ProductTag" AS ENUM ('NEW_PRODUCT', 'UNOPENED', 'USED', 'A_GRADE', 'USED_FEELING', 'DAMAGED', 'LIMITED_EDITION', 'DISCONTINUED', 'FREE_SHIPPING', 'DIRECT_DEAL', 'PRICE_NEGOTIABLE', 'URGENT_SALE', 'ELECTRONICS', 'CLOTHING', 'BOOKS', 'FURNITURE', 'SPORTS_EQUIPMENT', 'RARE_ITEM', 'FILM_CAMERA', 'VINTAGE');

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "isSold" BOOLEAN NOT NULL DEFAULT false,
    "tags" "ProductTag"[],
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "usersId" TEXT NOT NULL,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "usersId" TEXT NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_comments" (
    "id" TEXT NOT NULL,
    "usersId" TEXT,
    "productsId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_comments" (
    "id" TEXT NOT NULL,
    "usersId" TEXT NOT NULL,
    "articlesId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE INDEX "Products_name_idx" ON "Products"("name");

-- CreateIndex
CREATE INDEX "Products_description_idx" ON "Products"("description");

-- CreateIndex
CREATE INDEX "articles_title_idx" ON "articles"("title");

-- CreateIndex
CREATE INDEX "articles_content_idx" ON "articles"("content");

-- CreateIndex
CREATE INDEX "product_comments_productsId_idx" ON "product_comments"("productsId");

-- CreateIndex
CREATE INDEX "product_comments_usersId_idx" ON "product_comments"("usersId");

-- CreateIndex
CREATE INDEX "article_comments_articlesId_idx" ON "article_comments"("articlesId");

-- CreateIndex
CREATE INDEX "article_comments_usersId_idx" ON "article_comments"("usersId");

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_comments" ADD CONSTRAINT "product_comments_productsId_fkey" FOREIGN KEY ("productsId") REFERENCES "Products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_comments" ADD CONSTRAINT "product_comments_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_articlesId_fkey" FOREIGN KEY ("articlesId") REFERENCES "articles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
