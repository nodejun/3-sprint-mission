/*
  Warnings:

  - Made the column `userId` on table `ArticleComment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `ProductComment` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ArticleComment" DROP CONSTRAINT "ArticleComment_userId_fkey";

-- DropForeignKey
ALTER TABLE "ProductComment" DROP CONSTRAINT "ProductComment_userId_fkey";

-- AlterTable
ALTER TABLE "ArticleComment" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "ProductComment" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ProductComment" ADD CONSTRAINT "ProductComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleComment" ADD CONSTRAINT "ArticleComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
