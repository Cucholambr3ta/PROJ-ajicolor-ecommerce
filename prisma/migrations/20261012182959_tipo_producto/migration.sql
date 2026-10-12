-- CreateEnum
CREATE TYPE "TipoProducto" AS ENUM ('Polera', 'Poleron', 'Totebag', 'Reloj', 'Papeleria');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "tipo" "TipoProducto" NOT NULL DEFAULT 'Polera';

