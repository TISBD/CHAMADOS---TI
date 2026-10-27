const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const appConfig = require('./src/config/appConfig');
const { runMigrations } = require('./src/database/migrations');
const { runSeeders } = require('./src/database/seeders');
const sanitizeInput = require('./src/middlewares/sanitizeMiddleware');
const errorHandler = require('./src/middlewares/errorHandler');
const { apiRateLimiter } = require('./src/middlewares/rateLimitMiddleware');
const apiRouter = require('./src/routes/apiRouter');

const app = express();

// 1. Inicialização do Banco de Dados
console.log('----------------------------------------------------');
console.log('⚡ HelpDesk Pro - Inicializando Sistema Corporativo');
console.log('----------------------------------------------------');
try {
  runMigrations();
  console.log('✔ Migrações do banco de dados executadas com sucesso.');
  runSeeders();
  console.log('✔ Carga inicial de dados (seeders) verificada/aplicada.');
} catch (err) {
  console.error('❌ Erro crítico ao inicializar o banco de dados:', err);
  process.exit(1);
}

// 2. Garante pastas essenciais
if (!fs.existsSync(appConfig.uploads.directory)) {
  fs.mkdirSync(appConfig.uploads.directory, { recursive: true });
}

// 3. Middlewares Globais de Segurança e Requisições
app.use(cors());
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeInput);

// 4. Servir arquivos estáticos (Frontend SPA e Uploads)
app.use('/uploads', express.static(appConfig.uploads.directory));
app.use(express.static(path.join(__dirname, 'public')));

// 5. Rate Limiter na API e montagem das Rotas REST
app.use('/api', apiRateLimiter, apiRouter);

// 6. Rota para SPA (Single Page Application) - Fallback para rotas do cliente
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  next();
});

// 7. Tratador Centralizado de Erros
app.use(errorHandler);

// 8. Iniciar o Servidor
const PORT = appConfig.port;
app.listen(PORT, () => {
  console.log(`🚀 HelpDesk Pro Server em execução na porta ${PORT}`);
  console.log(`🌐 Acesse no seu navegador: http://localhost:${PORT}`);
  console.log('👤 Usuários pré-configurados:');
  console.log('   - Administrador: admin@empresa.com / admin123');
  console.log('   - Técnico de TI:  tecnico@empresa.com / tecnico123');
  console.log('   - Colaborador:    usuario@empresa.com / user123');
  console.log('----------------------------------------------------');
});
