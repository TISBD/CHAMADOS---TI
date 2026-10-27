const multer = require('multer');
const path = require('path');
const fs = require('fs');
const appConfig = require('../config/appConfig');

if (!fs.existsSync(appConfig.uploads.directory)) {
  fs.mkdirSync(appConfig.uploads.directory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, appConfig.uploads.directory);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    cb(null, `${safeBase}-${uniqueSuffix}${ext}`);
  }
});

function fileFilter(req, file, cb) {
  if (appConfig.uploads.allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não permitido (${file.mimetype}). Envie imagens, PDFs, TXT ou ZIP.`));
  }
}

const upload = multer({
  storage,
  limits: {
    fileSize: appConfig.uploads.maxFileSize
  },
  fileFilter
});

module.exports = upload;
