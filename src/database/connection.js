const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const appConfig = require('../config/appConfig');

let instance = null;

function getDatabase() {
  if (instance) return instance;

  const dbDir = path.dirname(appConfig.database.filePath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  instance = new DatabaseSync(appConfig.database.filePath);

  // Otimizações corporativas: WAL mode para concorrência de leitura/escrita, chaves estrangeiras ativas
  instance.exec('PRAGMA journal_mode = WAL;');
  instance.exec('PRAGMA foreign_keys = ON;');
  instance.exec('PRAGMA synchronous = NORMAL;');

  return instance;
}

module.exports = {
  getDatabase
};
