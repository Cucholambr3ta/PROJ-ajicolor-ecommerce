-- CreateEnum
CREATE TYPE "LadoPrenda" AS ENUM ('Frente', 'Espalda');

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "disenoEspaldaUrlLibre" TEXT;

-- AlterTable
ALTER TABLE "PrendaBase" ADD COLUMN     "modelo3dUrl" TEXT;

-- CreateTable
CREATE TABLE "PrendaZona" (
    "id" TEXT NOT NULL,
    "prendaBaseId" TEXT NOT NULL,
    "lado" "LadoPrenda" NOT NULL,
    "anchoCm" DECIMAL(65,30) NOT NULL,
    "altoCm" DECIMAL(65,30) NOT NULL,
    "x2d" DECIMAL(65,30) NOT NULL,
    "y2d" DECIMAL(65,30) NOT NULL,
    "w2d" DECIMAL(65,30) NOT NULL,
    "h2d" DECIMAL(65,30) NOT NULL,
    "pos3d" JSONB NOT NULL,
    "rot3d" JSONB NOT NULL,
    "size3d" JSONB NOT NULL,

    CONSTRAINT "PrendaZona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CotizacionDiseno" (
    "id" TEXT NOT NULL,
    "cotizacionId" TEXT NOT NULL,
    "lado" "LadoPrenda" NOT NULL,
    "disenoUrl" TEXT NOT NULL,
    "escalaPct" INTEGER NOT NULL DEFAULT 100,
    "anchoPx" INTEGER NOT NULL,
    "altoPx" INTEGER NOT NULL,
    "previewUrl" TEXT,

    CONSTRAINT "CotizacionDiseno_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PrendaZona_prendaBaseId_lado_key" ON "PrendaZona"("prendaBaseId", "lado");

-- CreateIndex
CREATE UNIQUE INDEX "CotizacionDiseno_cotizacionId_lado_key" ON "CotizacionDiseno"("cotizacionId", "lado");

-- AddForeignKey
ALTER TABLE "PrendaZona" ADD CONSTRAINT "PrendaZona_prendaBaseId_fkey" FOREIGN KEY ("prendaBaseId") REFERENCES "PrendaBase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CotizacionDiseno" ADD CONSTRAINT "CotizacionDiseno_cotizacionId_fkey" FOREIGN KEY ("cotizacionId") REFERENCES "CotizacionPersonalizada"("id") ON DELETE CASCADE ON UPDATE CASCADE;
