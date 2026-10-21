-- AlterTable
ALTER TABLE "Product" ADD COLUMN "kidsVersionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Product_kidsVersionId_key" ON "Product"("kidsVersionId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_kidsVersionId_fkey" FOREIGN KEY ("kidsVersionId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
