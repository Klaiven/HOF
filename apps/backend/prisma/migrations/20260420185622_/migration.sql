-- CreateTable
CREATE TABLE "UsuarioCeSu" (
    "id" SERIAL NOT NULL,
    "nomeCompleto" TEXT NOT NULL,
    "ramalTelefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "setor" TEXT NOT NULL,
    "descricao" TEXT,
    "horarioAbertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "horarioAtendimento" TIMESTAMP(3),
    "usuarioAtendimento" TEXT,
    "resolvido" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UsuarioCeSu_pkey" PRIMARY KEY ("id")
);
