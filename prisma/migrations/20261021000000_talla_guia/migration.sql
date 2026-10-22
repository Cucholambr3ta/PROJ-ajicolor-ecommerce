-- CreateTable
CREATE TABLE "TallaGuia" (
    "id" TEXT NOT NULL,
    "tipo" "TipoProducto" NOT NULL,
    "categoria" "CategoriaProducto" NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TallaGuia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TallaGuia_tipo_categoria_key" ON "TallaGuia"("tipo", "categoria");
