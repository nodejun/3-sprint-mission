-- AlterEnum
ALTER TYPE "ProductTag" ADD VALUE 'IMAGE_UPLOADED';

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::"ProductTag"[];
