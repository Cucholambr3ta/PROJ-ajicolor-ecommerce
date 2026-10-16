-- CreateTable
CREATE TABLE "Color" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "hex" TEXT NOT NULL,
    "categoria" "CategoriaProducto" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Color_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Color_nombre_categoria_key" ON "Color"("nombre", "categoria");

