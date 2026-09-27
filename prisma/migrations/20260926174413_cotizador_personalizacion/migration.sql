-- CreateEnum
CREATE TYPE "EstadoCotizacion" AS ENUM ('Pendiente', 'EnRevision', 'Cotizada', 'Aceptada', 'Rechazada');

-- CreateTable
CREATE TABLE "PrendaBase" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT,
    "precioBase" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "zonaAnchoCm" DECIMAL(65,30),
    "zonaAltoCm" DECIMAL(65,30),
    "tallasDisponibles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrendaBase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrendaColor" (
    "id" TEXT NOT NULL,
    "prendaBaseId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "hex" TEXT NOT NULL,
    "mockupFrenteUrl" TEXT,
    "mockupEspaldaUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrendaColor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CotizacionPersonalizada" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "nombreContacto" TEXT NOT NULL,
    "emailContacto" TEXT NOT NULL,
    "telefonoContacto" TEXT,
    "prendaBaseId" TEXT NOT NULL,
    "colorNombre" TEXT NOT NULL,
    "talla" TEXT,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "disenoUrl" TEXT NOT NULL,
    "notas" TEXT,
    "precioCotizado" DECIMAL(65,30),
    "estado" "EstadoCotizacion" NOT NULL DEFAULT 'Pendiente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CotizacionPersonalizada_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PrendaBase_slug_key" ON "PrendaBase"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PrendaColor_prendaBaseId_nombre_key" ON "PrendaColor"("prendaBaseId", "nombre");

-- AddForeignKey
ALTER TABLE "PrendaColor" ADD CONSTRAINT "PrendaColor_prendaBaseId_fkey" FOREIGN KEY ("prendaBaseId") REFERENCES "PrendaBase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CotizacionPersonalizada" ADD CONSTRAINT "CotizacionPersonalizada_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CotizacionPersonalizada" ADD CONSTRAINT "CotizacionPersonalizada_prendaBaseId_fkey" FOREIGN KEY ("prendaBaseId") REFERENCES "PrendaBase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

