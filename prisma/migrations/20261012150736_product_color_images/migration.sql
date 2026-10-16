-- CreateTable
CREATE TABLE "ProductColorImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "lado" "LadoPrenda" NOT NULL DEFAULT 'Frente',
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductColorImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductColorImage_productId_color_lado_key" ON "ProductColorImage"("productId", "color", "lado");

-- AddForeignKey
ALTER TABLE "ProductColorImage" ADD CONSTRAINT "ProductColorImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

