const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'C:/inetpub/wwwroot/hof/publicacoes';

    fs.mkdirSync(dir, { recursive: true });

    cb(null, dir);
  },

  filename: (req, file, cb) => {
    const nome = Date.now() + path.extname(file.originalname);
    cb(null, nome);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'video/mp4'
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo inválido'), false);
  }
};

module.exports = multer({
  storage,
  fileFilter
});