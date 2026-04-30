const cron = require('node-cron');
const { getTempoLaudo, getExamesImagem, getPainelLaudos } = require('./indicadores.service');
const prisma = require('../../config/prisma');

async function syncTempoLaudo(diasParaSincronizar = 7) {
  try {
    console.log(`🔄 [CRON] Sincronizando Tempo de Laudo (Janela móvel de ${diasParaSincronizar} dias)...`);

    const indicador = await prisma.indicador.upsert({
      where: { nome: 'Tempo de Laudo' },
      update: {}, 
      create: {
        nome: 'Tempo de Laudo',
        classe: 'Desempenho Clínico',
        setor: 'Radiologia'
      }
    });

    const dadosOracle = await getTempoLaudo(diasParaSincronizar);

    if (!dadosOracle || dadosOracle.length === 0) {
      console.log('⚠️ [CRON] Tempo de Laudo: Nenhum dado recente no Oracle.');
      return;
    }

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
    dataCorte.setHours(0,0,0,0); // Garante o início do dia

    await prisma.$transaction([
      // Remove apenas o que está na janela de sincronização atual
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

    console.log(`✅ [CRON] Tempo de Laudo: Atualizado (Histórico mantido).`);
  } catch (error) {
    console.error('❌ [CRON] Erro em Tempo de Laudo:', error);
  }
}

async function syncExamesImagem(diasParaSincronizar = 7) {
  try {
    console.log(`🔄 [CRON] Sincronizando Exames de Imagem (Janela móvel de ${diasParaSincronizar} dias)...`);
    
    const indicador = await prisma.indicador.upsert({
      where: { nome: 'Exames de Imagem' },
      update: {}, 
      create: {
        nome: 'Exames de Imagem',
        classe: 'Desempenho Clinico',
        setor: 'Radiologia'
      }
    });

    const dadosOracle = await getExamesImagem(diasParaSincronizar);

    if (!dadosOracle || dadosOracle.length === 0) {
      console.log('⚠️ [CRON] Exames de Imagem: Nenhum dado recente no Oracle.');
      return;
    }

    const novosValores = dadosOracle.map((linha) => ({
      indicadorId: indicador.id,
      data: new Date(linha.DT_PEDIDO),
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
    dataCorte.setHours(0,0,0,0);

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

    console.log(`✅ [CRON] Exames de Imagem: Atualizado (Histórico mantido).`);
  } catch (error) {
    console.error('❌ [CRON] Erro em Exames de Imagem:', error);
  }
}

async function syncPainelLaudos(diasParaSincronizar = 7) {
  try {
    console.log(`🔄 [CRON] Sincronizando Painel de Laudos (Janela móvel de ${diasParaSincronizar} dias)...`);
    
    const indicador = await prisma.indicador.upsert({
      where: { nome: 'Painel de Laudos' },
      update: {}, 
      create: {
        nome: 'Painel de Laudos',
        classe: 'Gestão Operacional',
        setor: 'Radiologia'
      }
    });

    const dadosOracle = await getPainelLaudos(diasParaSincronizar);

    if (!dadosOracle || dadosOracle.length === 0) {
      console.log('⚠️ [CRON] Painel de Laudos: Nenhum dado recente no Oracle.');
      return;
    }

    const novosValores = dadosOracle.map((linha) => ({
      indicadorId: indicador.id,
      data: new Date(linha.DT_PEDIDO),
      dados: {
        pedido: linha.PEDIDO,
        prontuario: linha.PRONTUARIO,
        paciente: linha.PACIENTE,
        id_exame: linha.ID_EXAME,
        exame: linha.EXAME,
        cd_setor_origem: linha.CD_SETOR_ORIGEM,
        nm_setor_origem: linha.NM_SETOR_ORIGEM,
        id_setor_executante: linha.ID_SETOR_EXECUTANTE,
        nm_medico_solicitante: linha.NM_MEDICO_SOLICITANTE,
        medico_laudo: linha.MEDICO_LAUDO,
        dt_pedido: linha.DT_PEDIDO,
        dt_study: linha.DT_STUDY,
        dt_laudado: linha.DT_LAUDADO,
        cd_study_uid: linha.CD_STUDY_UID,
        tp_atendimento: linha.TP_ATENDIMENTO,
        status_laudo: linha.STATUS_LAUDO,
        status_imagem: linha.STATUS_IMAGEM
      }
    }));

    const dataCorte = new Date();
    dataCorte.setDate(dataCorte.getDate() - diasParaSincronizar);
    dataCorte.setHours(0,0,0,0);

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

    console.log(`✅ [CRON] Painel de Laudos: Atualizado (Histórico mantido).`);
  } catch (error) {
    console.error('❌ [CRON] Erro no Painel de Laudos:', error);
  }
}

// Agendamento a cada 15 minutos para manter os últimos 7 dias sempre frescos
cron.schedule('*/15 * * * *', () => {
  syncTempoLaudo(7);
  syncExamesImagem(7); 
  syncPainelLaudos(7);
});

// Carga inicial (Janela de 7 dias) ao subir o serviço
syncTempoLaudo(7);
syncExamesImagem(7); 
syncPainelLaudos(7);

module.exports = { 
  syncTempoLaudo,
  syncExamesImagem,
  syncPainelLaudos
};
