const { getConnection } = require('../../config/hospitalDb');

// Função 1: Tempo de Laudo - Padrão 7 dias
exports.getTempoLaudo = async (diasRetroativos = 7) => {
  const conn = await getConnection();
  const result = await conn.execute(
    `SELECT * FROM vw_indicador_tempo_laudo 
     WHERE dia >= TRUNC(SYSDATE) - :diasRetroativos 
     ORDER BY dia DESC`,
    [diasRetroativos],
    { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
  );
  await conn.close();
  return result.rows;
};

// Função 2: Exames de Imagem - Padrão 7 dias
exports.getExamesImagem = async (diasRetroativos = 7) => {
  const conn = await getConnection();
  const result = await conn.execute(
    `SELECT * FROM vw_rx_exames 
     WHERE DT_PEDIDO >= TRUNC(SYSDATE) - :diasRetroativos 
     ORDER BY DT_PEDIDO DESC`,
    [diasRetroativos],
    { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
  );
  await conn.close();
  return result.rows;
};

// Função 3: Painel de Laudos (Consolidado) - Padrão 7 dias
exports.getPainelLaudos = async (diasRetroativos = 7) => {
  const conn = await getConnection();
  const result = await conn.execute(
    `SELECT * FROM VW_PAINEL_LAUDOS_CONSOLIDADO 
     WHERE DT_PEDIDO >= TRUNC(SYSDATE) - :diasRetroativos 
     ORDER BY DT_PEDIDO DESC`,
    [diasRetroativos],
    { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
  );
  await conn.close();
  return result.rows;
};