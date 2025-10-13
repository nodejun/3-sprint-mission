-- DropForeignKey
ALTER TABLE "article_comments" DROP CONSTRAINT "article_comments_articlesId_fkey";

-- DropForeignKey
ALTER TABLE "article_comments" DROP CONSTRAINT "article_comments_usersId_fkey";

-- AlterTable
ALTER TABLE "article_comments" ALTER COLUMN "usersId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_articlesId_fkey" FOREIGN KEY ("articlesId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
