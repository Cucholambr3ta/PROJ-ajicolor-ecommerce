-- CreateEnum
CREATE TYPE "ResolucionDevolucion" AS ENUM ('Reembolso', 'Cambio');

-- AlterTable
ALTER TABLE "Shipment" ADD COLUMN     "devolucionAt" TIMESTAMP(3),
ADD COLUMN     "devolucionMontoReembolsado" DECIMAL(65,30),
ADD COLUMN     "devolucionMotivo" TEXT,
ADD COLUMN     "devolucionNotas" TEXT,
ADD COLUMN     "devolucionResolucion" "ResolucionDevolucion";
