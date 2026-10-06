-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_variantId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "cotizacionId" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "colorLibre" TEXT,
ADD COLUMN     "descripcionLibre" TEXT,
ADD COLUMN     "disenoUrlLibre" TEXT,
ADD COLUMN     "tallaLibre" TEXT,
ALTER COLUMN "variantId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_cotizacionId_key" ON "Order"("cotizacionId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_cotizacionId_fkey" FOREIGN KEY ("cotizacionId") REFERENCES "CotizacionPersonalizada"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

