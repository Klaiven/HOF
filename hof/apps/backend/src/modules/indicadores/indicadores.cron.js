const cron = require('node-cron');
const { getTempoLaudo, getExamesImagem } = require('./indicadores.service');
const prisma = require('../../config/prisma');

async function syncTempoLaudo(diasParaSincronizar = 90) {
  try {
    console.log(`🔄 [CRON] Buscando dados dos últimos ${diasParaSincronizar} dias no Oracle...`);
    

    const dadosOracle = await getTempoLaudo(diasParaSincronizar);

    if (!dadosOracle || dadosOracle.length === 0) {
      console.log('⚠️ [CRON] Nenhum dado retornado.');
      return;
    }

    const indicador = await prisma.indicador.upsert({
      where: { nome: 'Tempo de Laudo' },
      update: {}, 
      create: {
        nome: 'Tempo de Laudo',
        classe: 'Desempenho Clínico',
        setor: 'Radiologia'
      }
    });

    const novosValores = dadosOracle.map((linha) => ({
      indicadorId: indicador.id,
      data: new Date(linha.DIA), 
      dados: {
        total_exames: linha.TOTAL_EXAMES,
        laudados: linha.LAUDADOS,
        tempo_medio_min: linha.TEMPO_MEDIO_MIN
      }
    }));

   
    const dataCorte = new Date();
    dataCorte.setDate(dataCorte.getDate() - diasParaSincronizar);


    await prisma.$transaction([
      prisma.indicadorValor.deleteMany({
        where: { 
          indicadorId: indicador.id,
          data: { gte: dataCorte } 
        }
      }),

      prisma.indicadorValor.createMany({
        data: novosValores
      })
    ]);

    console.log(`✅ [CRON] Sincronização Incremental concluída! ${novosValores.length} dias atualizados no HOF.`);
  } catch (error) {
    console.error('❌ [CRON] Erro na sincronização:', error);
  }
}

async function syncExamesImagem(diasParaSincronizar = 90) {
  try {
    console.log(`🔄 [CRON] Buscando Exames de Imagem dos últimos ${diasParaSincronizar} dias...`);
    
    const dadosOracle = await getExamesImagem(diasParaSincronizar);

    if (!dadosOracle || dadosOracle.length === 0) {
      console.log('⚠️ [CRON] Nenhum exame de imagem retornado.');
      return;
    }

    // 1. Garante que o indicador "Exames de Imagem" existe
    const indicador = await prisma.indicador.upsert({
      where: { nome: 'Exames de Imagem' },
      update: {}, 
      create: {
        nome: 'Exames de Imagem',
        classe: 'Desempenho Clinico', // Conforme você solicitou
        setor: 'Radiologia'           // Conforme você solicitou
      }
    });

    // 2. Mapeia as linhas do Oracle. 
    // Como a view é analítica, cada linha vira um JSON independente.
    const novosValores = dadosOracle.map((linha) => ({
      indicadorId: indicador.id,
      data: new Date(linha.DT_PEDIDO), // Usamos a data do pedido do exame
      dados: {
        pedido: linha.PEDIDO,
        prontuario: linha.PRONTUARIO,
        paciente: linha.PACIENTE,
        dt_nascimento: linha.DT_NASCIMENTO,
        exame: linha.EXAME,
        medico: linha.MEDICO,
        leito: linha.LEITO,
        setor_executante: linha.SETOR_EXECUTANTE,
        dt_laudado: linha.DT_LAUDADO,
        tempo_minutos: linha.TEMPO_MINUTOS,
        status_laudo: linha.STATUS_LAUDO
      }
    }));

    const dataCorte = new Date();
    dataCorte.setDate(dataCorte.getDate() - diasParaSincronizar);

    // 3. Substitui os exames antigos pelo lote atualizado (Carga Incremental)
    await prisma.$transaction([
      prisma.indicadorValor.deleteMany({
        where: { 
          indicadorId: indicador.id,
          data: { gte: dataCorte } 
        }
      }),
      prisma.indicadorValor.createMany({
        data: novosValores
      })
    ]);

    console.log(`✅ [CRON] Exames de Imagem: ${novosValores.length} registros atualizados!`);
  } catch (error) {
    console.error('❌ [CRON] Erro em Exames de Imagem:', error);
  }
}


cron.schedule('*/15 * * * *', () => {
  syncTempoLaudo(90)
  syncExamesImagem(90); 
});

syncExamesImagem(90); 

module.exports = { 
  syncTempoLaudo,
  syncExamesImagem 
};


//syncTempoLaudo(4500); // 4500 dias = ~12 anos *ativar 1x por ano para buscar todo o histórico*
