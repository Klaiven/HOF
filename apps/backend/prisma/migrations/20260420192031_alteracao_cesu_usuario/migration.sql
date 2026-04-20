/*
  Warnings:

  - You are about to drop the column `usuarioAtendimento` on the `UsuarioCeSu` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UsuarioCeSu" DROP COLUMN "usuarioAtendimento",
ADD COLUMN     "usuarioAtendimentoId" INTEGER;

-- AddForeignKey
ALTER TABLE "UsuarioCeSu" ADD CONSTRAINT "UsuarioCeSu_usuarioAtendimentoId_fkey" FOREIGN KEY ("usuarioAtendimentoId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
