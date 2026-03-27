const oracledb = require('oracledb');

try {
  oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_DIR });
  console.log('Oracle Client inicializado no modo Thick com sucesso!');
} catch (err) {
  console.error('Falha ao inicializar o Oracle Client. Verifique o caminho no .env', err);
  process.exit(1);
}

async function getConnection() {
  return await oracledb.getConnection({
    user: process.env.HOSP_DB_USER,
    password: process.env.HOSP_DB_PASS,
    connectString: process.env.HOSP_DB_TNS
  });
}

module.exports = { getConnection };