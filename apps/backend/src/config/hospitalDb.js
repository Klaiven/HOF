const oracledb = require('oracledb');

async function getConnection() {
  return await oracledb.getConnection({
    user: process.env.HOSP_DB_USER,
    password: process.env.HOSP_DB_PASS,
    connectString: process.env.HOSP_DB_TNS
  });
}

module.exports = { getConnection };