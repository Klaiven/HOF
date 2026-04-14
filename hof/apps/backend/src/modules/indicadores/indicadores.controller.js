// const service = require('./indicadores.service.js');
// const { getConnection } = require('../../config/hospitalDb');

// exports.getTempoLaudo = async (req, res) => {
//   try {
//     const data = await service.getTempoLaudo();
//     res.json(data);
//   } catch (error) {
//     console.error('ERRO REAL:', error); // 👈 MOSTRA TUDO

//     res.status(500).json({
//       error: error.message,
//       code: error.errorNum || null
//     });
//   }
// };

const prisma = require('../../config/prisma');

exports.getTempoLaudo = async (req, res) => {
  try {
    const indicador = await prisma.indicador.findUnique({
      where: { nome: 'Tempo de Laudo' },
      include: {
        valores: {
          orderBy: { data: 'desc' },
          take: 30 // Traz os últimos 30 registros (dias)
        }
      }
    });

    if (!indicador || indicador.valores.length === 0) {
      return res.status(404).json({ message: 'Dados de Tempo de Laudo ainda não sincronizados.' });
    }

    res.json(indicador);
  } catch (error) {
    console.error('ERRO REAL:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getExamesImagem = async (req, res) => {
  try {
    const indicador = await prisma.indicador.findUnique({
      where: { nome: 'Exames de Imagem' },
      include: {
        valores: {
          orderBy: { data: 'desc' },
          // ATENÇÃO: Como é um registro por exame, limitei a 500 para não travar o navegador
          take: 500 
        }
      }
    });

    if (!indicador || indicador.valores.length === 0) {
      return res.status(404).json({ message: 'Dados de Exames de Imagem ainda não sincronizados.' });
    }

    res.json(indicador);
  } catch (error) {
    console.error('ERRO REAL:', error);
    res.status(500).json({ error: error.message });
  }
};

