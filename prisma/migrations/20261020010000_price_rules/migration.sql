-- CreateTable
CREATE TABLE "PriceRule" (
    "id" TEXT NOT NULL,
    "tipo" "TipoProducto" NOT NULL,
    "talleDesde" TEXT NOT NULL,
    "talleHasta" TEXT NOT NULL,
    "precio" DECIMAL(65,30) NOT NULL,
    "productId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PriceRule_tipo_talleDesde_talleHasta_productId_key" ON "PriceRule"("tipo", "talleDesde", "talleHasta", "productId");

-- AddForeignKey
ALTER TABLE "PriceRule" ADD CONSTRAINT "PriceRule_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
