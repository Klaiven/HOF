/*
  Warnings:

  - You are about to drop the column `valor` on the `IndicadorValor` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nome]` on the table `Indicador` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dados` to the `IndicadorValor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IndicadorValor" DROP COLUMN "valor",
ADD COLUMN     "dados" JSONB NOT NULL,
ALTER COLUMN "data" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Indicador_nome_key" ON "Indicador"("nome");
