// exports.getTempoLaudo = async (req, res) => {
//   try {
//     const data = await service.getTempoLaudo();
//     res.json(data);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Erro ao buscar indicador' });
//   }
// };

const service = require('./indicadores.service.js');
const { getConnection } = require('../../config/hospitalDb');

exports.getTempoLaudo = async (req, res) => {
  try {
    const data = await service.getTempoLaudo();
    res.json(data);
  } catch (error) {
    console.error('ERRO REAL:', error); // 👈 MOSTRA TUDO

    res.status(500).json({
      error: error.message,
      code: error.errorNum || null
    });
  }
};

