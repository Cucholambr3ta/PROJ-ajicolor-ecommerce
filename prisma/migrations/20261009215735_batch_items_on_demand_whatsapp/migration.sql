-- DropForeignKey
ALTER TABLE "ProductionBatchItem" DROP CONSTRAINT "ProductionBatchItem_variantId_fkey";

-- AlterTable
ALTER TABLE "ProductionBatch" ADD COLUMN     "mensajeWhatsapp" TEXT;

-- AlterTable
ALTER TABLE "ProductionBatchItem" ADD COLUMN     "colorLibre" TEXT,
ADD COLUMN     "tallaLibre" TEXT,
ALTER COLUMN "variantId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ProductionBatchItem" ADD CONSTRAINT "ProductionBatchItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

