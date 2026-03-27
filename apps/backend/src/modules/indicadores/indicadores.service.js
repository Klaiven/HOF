// const { getConnection } = require('../../config/hospitalDb');

// exports.getTempoLaudo = async () => {
//   const conn = await getConnection();

//   const result = await conn.execute(`
//     SELECT * FROM vw_indicador_tempo_laudo
//   `);

//   await conn.close();

//   return result.rows;
// };

const { getConnection } = require('../../config/hospitalDb');

exports.getTempoLaudo = async () => {
  const conn = await getConnection();

  const result = await conn.execute(
    `SELECT * FROM vw_indicador_tempo_laudo`,
    [],
    { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
  );

  await conn.close();

  return result.rows;
};