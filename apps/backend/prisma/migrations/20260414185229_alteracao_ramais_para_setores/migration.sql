/*
  Warnings:

  - You are about to drop the `Ramal` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Ramal";

-- CreateTable
CREATE TABLE "Setores" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "subsetor" TEXT,
    "ramal" TEXT,

    CONSTRAINT "Setores_pkey" PRIMARY KEY ("id")
);
