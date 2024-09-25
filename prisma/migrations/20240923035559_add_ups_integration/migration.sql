-- AlterTable
ALTER TABLE "User" ADD COLUMN     "upsAccessToken" TEXT,
ADD COLUMN     "upsRefreshToken" TEXT,
ADD COLUMN     "upsTokenExpires" TIMESTAMP(3);
