const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static('uploads'));

require('./modules/indicadores/indicadores.cron');

app.get('/', (req, res) => {
  res.send('API rodando 🚀');
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

const routes = require('./routes');
app.use('/api', routes);