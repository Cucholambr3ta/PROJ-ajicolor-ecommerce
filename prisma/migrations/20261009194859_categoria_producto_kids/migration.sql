-- CreateEnum
CREATE TYPE "CategoriaProducto" AS ENUM ('Adulto', 'Kids');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "categoria" "CategoriaProducto" NOT NULL DEFAULT 'Adulto';

