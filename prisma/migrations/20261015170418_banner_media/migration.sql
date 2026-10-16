-- CreateEnum
CREATE TYPE "BannerMedia" AS ENUM ('Imagen', 'Video');

-- AlterTable
ALTER TABLE "Banner" ADD COLUMN     "tipo" "BannerMedia" NOT NULL DEFAULT 'Imagen';

