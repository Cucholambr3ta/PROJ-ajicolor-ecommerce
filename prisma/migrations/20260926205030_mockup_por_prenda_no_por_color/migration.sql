-- AlterTable
ALTER TABLE "PrendaBase" ADD COLUMN     "mockupEspaldaUrl" TEXT,
ADD COLUMN     "mockupFrenteUrl" TEXT;

-- AlterTable
ALTER TABLE "PrendaColor" DROP COLUMN "mockupEspaldaUrl",
DROP COLUMN "mockupFrenteUrl";

