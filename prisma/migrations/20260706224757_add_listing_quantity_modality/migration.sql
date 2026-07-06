-- CreateEnum
CREATE TYPE "HelpModality" AS ENUM ('PRESENCIAL', 'ONLINE');

-- CreateEnum
CREATE TYPE "QuantityUnit" AS ENUM ('KIT', 'UNIDAD', 'PERSONA', 'FAMILIA', 'HORA', 'SESION');

-- AlterTable
ALTER TABLE "HelpListing" ADD COLUMN     "modality" "HelpModality" NOT NULL DEFAULT 'PRESENCIAL',
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "quantityUnit" "QuantityUnit" NOT NULL DEFAULT 'UNIDAD';
