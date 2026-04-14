const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());


const linksRoutes = require('./modules/links/links.routes');
app.use('/api/links', linksRoutes);

const routes = require('./routes');
app.use('/api', routes);


app.use('/uploadslinks', express.static('uploadslinks'));

app.use('/uploads', express.static('uploads', {
  setHeaders: (res, filePath) => {

    if (filePath.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Accept-Ranges', 'bytes');
    }

    if (filePath.endsWith('.webm')) {
      res.setHeader('Content-Type', 'video/webm');
    }

    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
    }
  }
}));

// 🔹 CRON
require('./modules/indicadores/indicadores.cron');



// const frontendPath = 'C:\\inetpub\\wwwroot\\hof';

// app.use(express.static(frontendPath));


// app.get(/.*/, (req, res) => {
//   res.sendFile(path.join(frontendPath, 'index.html'));
// });


const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});