const { getConnection } = require('../../config/hospitalDb');

// Função 1: Tempo de Laudo
exports.getTempoLaudo = async (diasRetroativos = 90) => {
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

// 👇 Função 2: Exames de Imagem (VERIFIQUE SE ESSA PARTE ESTÁ AQUI)
exports.getExamesImagem = async (diasRetroativos = 90) => {
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